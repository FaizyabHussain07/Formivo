import "server-only";

import { getWorkspaceEntitlements } from "@/lib/billing/entitlements";
import { currentUsageWindow } from "@/lib/billing/plans";
import { AppError, mapDatabaseError } from "@/lib/errors";
import { isOriginAllowed, parseAllowedOrigins } from "@/lib/forms/service";
import { hashRequestBody } from "@/lib/security/tokens";
import { requireAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

import { parseSubmissionPayload } from "./validation";

type FormForSubmission = {
  id: string;
  workspace_id: string;
  status: string;
  settings: Json;
};

async function loadForm(formId: string): Promise<FormForSubmission> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select("id, workspace_id, status, settings")
    .eq("id", formId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!data) throw new AppError("FORM_NOT_FOUND");
  return data as FormForSubmission;
}

export type FormOriginPolicy = {
  allowedOrigins: string[];
  status: string;
};

/** Origin policy for CORS/preflight, without running the submission pipeline. */
export async function getFormOriginPolicy(formId: string): Promise<FormOriginPolicy | null> {
  try {
    const form = await loadForm(formId);
    return { allowedOrigins: parseAllowedOrigins(form.settings), status: form.status };
  } catch (error) {
    if (error instanceof AppError && error.code === "FORM_NOT_FOUND") return null;
    throw error;
  }
}

async function enforceRateLimit(bucket: string, limit: number, label: string): Promise<void> {
  const admin = requireAdminClient();
  const windowStart = new Date(Math.floor(Date.now() / 60_000) * 60_000).toISOString();
  const { error } = await admin.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_window_start: windowStart,
    p_limit: limit,
  });
  if (error) {
    if (error.message.includes("RATE_LIMITED")) {
      // Operational signal only — no IPs, payloads or personal data.
      console.warn(`[formivo] rate limit reached (${label})`);
      throw new AppError("RATE_LIMITED");
    }
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
  payload: unknown;
  sourceOrigin?: string | null;
  requestOrigin?: string | null;
  idempotencyKey?: string | null;
  clientIp?: string | null;
  internal?: boolean;
};

export type IngestResult = {
  submissionId: string;
  replayed: boolean;
  usageCount: number;
  usageLimit: number;
};

/**
 * The single submission pipeline used by the public endpoint and the dashboard's
 * test action. The public endpoint requires only the form id: security comes from
 * form lifecycle checks, rate limits, quotas, payload validation and origin policy.
 *
 * There is deliberately no secret, key or token in this flow.
 */
export async function ingestSubmission(input: IngestInput): Promise<IngestResult> {
  const form = await loadForm(input.formId);

  if (form.status !== "active") throw new AppError("FORM_INACTIVE");

  if (!input.internal) {
    if (!isOriginAllowed(input.requestOrigin ?? null, parseAllowedOrigins(form.settings))) {
      throw new AppError(
        "FORBIDDEN",
        "This website is not allowed to submit to this form. Ask the form owner to allow its origin.",
      );
    }

    // Distributed fixed-window limits: per form, per IP, and per form+IP.
    await enforceRateLimit(`submission:form:${form.id}`, 120, "form");
    if (input.clientIp) {
      await enforceRateLimit(`submission:ip:${input.clientIp}`, 60, "ip");
      await enforceRateLimit(`submission:form-ip:${form.id}:${input.clientIp}`, 30, "form-ip");
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
