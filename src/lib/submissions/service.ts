import "server-only";

import { getWorkspaceEntitlements } from "@/lib/billing/entitlements";
import { currentUsageWindow } from "@/lib/billing/plans";
import { AppError, mapDatabaseError } from "@/lib/errors";
import { hashRequestBody, verifyFormSecret } from "@/lib/security/tokens";
import { requireAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

import { parseSubmissionPayload } from "./validation";

type FormForSubmission = {
  id: string;
  workspace_id: string;
  status: string;
  secret_hash: string | null;
};

async function loadForm(formId: string): Promise<FormForSubmission> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select("id, workspace_id, status, secret_hash")
    .eq("id", formId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!data) throw new AppError("FORM_NOT_FOUND");
  return data;
}

async function enforceRateLimit(bucket: string, limit: number): Promise<void> {
  const admin = requireAdminClient();
  const windowStart = new Date(Math.floor(Date.now() / 60_000) * 60_000).toISOString();
  const { error } = await admin.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_window_start: windowStart,
    p_limit: limit,
  });
  if (error) {
    if (error.message.includes("RATE_LIMITED")) throw new AppError("RATE_LIMITED");
    throw new AppError("INTERNAL_ERROR", error.message);
  }
}

type IdempotencyClaim = { kind: "claimed" } | { kind: "replay"; submissionId: string };

async function claimIdempotency(
  formId: string,
  key: string,
  requestHash: string,
): Promise<IdempotencyClaim> {
  const admin = requireAdminClient();
  const normalizedKey = key.trim().slice(0, 255);

  const { data: existing, error: lookupError } = await admin
    .from("submission_idempotency")
    .select("request_hash, submission_id")
    .eq("form_id", formId)
    .eq("idempotency_key", normalizedKey)
    .maybeSingle();
  if (lookupError) throw new AppError("INTERNAL_ERROR", lookupError.message);

  if (existing) {
    if (existing.request_hash !== requestHash) throw new AppError("IDEMPOTENCY_CONFLICT");
    if (existing.submission_id) {
      return { kind: "replay", submissionId: existing.submission_id };
    }
    throw new AppError("IDEMPOTENCY_CONFLICT", "A request with this key is still processing.");
  }

  const { error: claimError } = await admin.from("submission_idempotency").insert({
    form_id: formId,
    idempotency_key: normalizedKey,
    request_hash: requestHash,
  });

  if (claimError) {
    if (claimError.code === "23505") {
      // Lost a race with a concurrent identical request.
      const { data: raced } = await admin
        .from("submission_idempotency")
        .select("request_hash, submission_id")
        .eq("form_id", formId)
        .eq("idempotency_key", normalizedKey)
        .maybeSingle();
      if (raced?.request_hash === requestHash && raced.submission_id) {
        return { kind: "replay", submissionId: raced.submission_id };
      }
      throw new AppError("IDEMPOTENCY_CONFLICT");
    }
    throw new AppError("INTERNAL_ERROR", claimError.message);
  }

  return { kind: "claimed" };
}

type IngestInput = {
  formId: string;
  secret?: string;
  payload: unknown;
  sourceOrigin?: string | null;
  idempotencyKey?: string | null;
  clientIp?: string | null;
  skipSecret?: boolean;
};

export type IngestResult = {
  submissionId: string;
  replayed: boolean;
  usageCount: number;
  usageLimit: number;
};

/**
 * The single submission pipeline used by both the public API and the dashboard's
 * "send test submission" action. Authorization for the internal path happens
 * before this call; the public path verifies the form secret here.
 */
export async function ingestSubmission(input: IngestInput): Promise<IngestResult> {
  const form = await loadForm(input.formId);

  if (form.status !== "active") throw new AppError("FORM_INACTIVE");

  if (!input.skipSecret) {
    if (!input.secret) throw new AppError("INVALID_FORM_SECRET", "Missing form secret.");
    if (!form.secret_hash) {
      throw new AppError(
        "INVALID_FORM_SECRET",
        "This form has no active secret. Generate one from the integration page.",
      );
    }
    if (!verifyFormSecret(input.secret, form.secret_hash)) {
      throw new AppError("INVALID_FORM_SECRET");
    }
  }

  if (!input.skipSecret) {
    await enforceRateLimit(`submission:form:${form.id}`, 120);
    if (input.clientIp) {
      await enforceRateLimit(`submission:ip:${input.clientIp}`, 30);
    }
  }

  const payload = parseSubmissionPayload(input.payload);
  const requestHash = hashRequestBody({ data: payload.data, metadata: payload.metadata });

  const entitlements = await getWorkspaceEntitlements(form.workspace_id);
  if (!entitlements.canAcceptSubmission) throw new AppError("QUOTA_EXCEEDED");

  const idempotencyKey = input.idempotencyKey?.trim();
  let claim: IdempotencyClaim | null = null;
  if (idempotencyKey) {
    claim = await claimIdempotency(form.id, idempotencyKey, requestHash);
    if (claim.kind === "replay") {
      return {
        submissionId: claim.submissionId,
        replayed: true,
        usageCount: entitlements.monthlyUsage,
        usageLimit: entitlements.plan.monthlyLeads,
      };
    }
  }

  const admin = requireAdminClient();
  const window = currentUsageWindow();

  const { data, error } = await admin.rpc("api_record_submission", {
    p_form_id: form.id,
    p_period_start: window.start.toISOString(),
    p_period_end: window.end.toISOString(),
    p_max_submissions: entitlements.plan.monthlyLeads,
    p_data: payload.data as Json,
    p_source_origin: input.sourceOrigin ?? undefined,
    p_metadata: payload.metadata as Json,
  });

  if (error) {
    if (idempotencyKey) {
      await admin
        .from("submission_idempotency")
        .delete()
        .eq("form_id", form.id)
        .eq("idempotency_key", idempotencyKey.trim().slice(0, 255))
        .is("submission_id", null);
    }
    throw mapDatabaseError(error.message);
  }

  const result = data as {
    submission_id?: string;
    usage_count?: number;
    usage_limit?: number;
  } | null;
  const submissionId = result?.submission_id;
  if (!submissionId) throw new AppError("INTERNAL_ERROR");

  if (idempotencyKey) {
    await admin
      .from("submission_idempotency")
      .update({ submission_id: submissionId })
      .eq("form_id", form.id)
      .eq("idempotency_key", idempotencyKey.trim().slice(0, 255));
  }

  return {
    submissionId,
    replayed: false,
    usageCount: result?.usage_count ?? entitlements.monthlyUsage + 1,
    usageLimit: result?.usage_limit ?? entitlements.plan.monthlyLeads,
  };
}
