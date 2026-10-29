import "server-only";

import { z } from "zod";

import { assertCanCreateForm } from "@/lib/billing/entitlements";
import { AppError } from "@/lib/errors";
import { generateFormSecret, hashFormSecret, lastFour } from "@/lib/security/tokens";
import { requireAdminClient } from "@/lib/supabase/admin";

export const formInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the form a name.")
    .max(120, "Keep the name under 120 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Keep the description under 2,000 characters.")
    .optional()
    .transform((value) => value || null),
  notificationEmail: z
    .union([z.literal(""), z.email("Enter a valid email address.")])
    .optional()
    .transform((value) => value || null),
});

export type FormRecord = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  status: string;
  notificationEmail: string | null;
  secretLastFour: string | null;
  hasSecret: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormRow = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  status: string;
  notification_email: string | null;
  secret_last_four: string | null;
  secret_hash: string | null;
  created_at: string;
  updated_at: string;
};

function toFormRecord(row: FormRow): FormRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    status: row.status,
    notificationEmail: row.notification_email,
    secretLastFour: row.secret_last_four,
    hasSecret: Boolean(row.secret_hash),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const FORM_COLUMNS =
  "id, workspace_id, name, description, status, notification_email, secret_last_four, secret_hash, created_at, updated_at";

export async function createForm(input: {
  workspaceId: string;
  userId: string;
  values: unknown;
}): Promise<{ formId: string; secret: string }> {
  const parsed = formInputSchema.safeParse(input.values);
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Please check the form details.",
      Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
      ),
    );
  }

  await assertCanCreateForm(input.workspaceId);

  const secret = generateFormSecret();
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("forms")
    .insert({
      workspace_id: input.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description,
      notification_email: parsed.data.notificationEmail,
      secret_hash: hashFormSecret(secret),
      secret_last_four: lastFour(secret),
    })
    .select("id")
    .single();

  if (error || !data) throw new AppError("INTERNAL_ERROR", error?.message);

  await admin.from("audit_logs").insert({
    actor_user_id: input.userId,
    workspace_id: input.workspaceId,
    action: "form.created",
    target_type: "form",
    target_id: data.id,
    metadata: { name: parsed.data.name },
  });

  return { formId: data.id, secret };
}

export async function getOwnedForm(formId: string, workspaceId: string): Promise<FormRecord> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select(FORM_COLUMNS)
    .eq("id", formId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!data) throw new AppError("FORM_NOT_FOUND");
  return toFormRecord(data as FormRow);
}

export async function listForms(workspaceId: string): Promise<FormRecord[]> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select(FORM_COLUMNS)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  return (data ?? []).map((row) => toFormRecord(row as FormRow));
}

/** Workspace for a form the caller has already been authorized to read. */
export async function getFormWorkspaceId(formId: string): Promise<string> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select("workspace_id")
    .eq("id", formId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!data) throw new AppError("FORM_NOT_FOUND");
  return data.workspace_id;
}

export async function updateForm(input: {
  formId: string;
  workspaceId: string;
  userId: string;
  name: string;
  description?: string | null;
  notificationEmail?: string | null;
}): Promise<void> {
  const parsed = formInputSchema.safeParse({
    name: input.name,
    description: input.description ?? "",
    notificationEmail: input.notificationEmail ?? "",
  });
  if (!parsed.success) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Please check the form details.",
      Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
      ),
    );
  }

  await getOwnedForm(input.formId, input.workspaceId);

  const admin = requireAdminClient();
  const { error } = await admin
    .from("forms")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      notification_email: parsed.data.notificationEmail,
    })
    .eq("id", input.formId)
    .eq("workspace_id", input.workspaceId);
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  await admin.from("audit_logs").insert({
    actor_user_id: input.userId,
    workspace_id: input.workspaceId,
    action: "form.updated",
    target_type: "form",
    target_id: input.formId,
  });
}

export async function setFormStatus(input: {
  formId: string;
  workspaceId: string;
  userId: string;
  status: "active" | "paused";
}): Promise<void> {
  await getOwnedForm(input.formId, input.workspaceId);

  const admin = requireAdminClient();
  const { error } = await admin
    .from("forms")
    .update({ status: input.status })
    .eq("id", input.formId)
    .eq("workspace_id", input.workspaceId);
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  await admin.from("audit_logs").insert({
    actor_user_id: input.userId,
    workspace_id: input.workspaceId,
    action: input.status === "active" ? "form.resumed" : "form.paused",
    target_type: "form",
    target_id: input.formId,
  });
}

/** Rotates the submission secret. The previous secret stops working immediately. */
export async function rotateFormSecret(input: {
  formId: string;
  workspaceId: string;
  userId: string;
}): Promise<string> {
  await getOwnedForm(input.formId, input.workspaceId);
  const secret = generateFormSecret();

  const admin = requireAdminClient();
  const { error } = await admin
    .from("forms")
    .update({ secret_hash: hashFormSecret(secret), secret_last_four: lastFour(secret) })
    .eq("id", input.formId)
    .eq("workspace_id", input.workspaceId);
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  await admin.from("audit_logs").insert({
    actor_user_id: input.userId,
    workspace_id: input.workspaceId,
    action: "form.secret_rotated",
    target_type: "form",
    target_id: input.formId,
  });

  return secret;
}

export type FormWithCounts = FormRecord & { submissionCount: number; newCount: number };

export async function listFormsWithCounts(workspaceId: string): Promise<FormWithCounts[]> {
  const forms = await listForms(workspaceId);
  if (forms.length === 0) return [];

  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .select("form_id, status")
    .in(
      "form_id",
      forms.map((form) => form.id),
    );
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  const counts = new Map<string, { total: number; new: number }>();
  for (const row of data ?? []) {
    const current = counts.get(row.form_id) ?? { total: 0, new: 0 };
    current.total += 1;
    if (row.status === "new") current.new += 1;
    counts.set(row.form_id, current);
  }

  return forms.map((form) => ({
    ...form,
    submissionCount: counts.get(form.id)?.total ?? 0,
    newCount: counts.get(form.id)?.new ?? 0,
  }));
}

export function formSubmissionEndpoint(appUrl: string, formId: string): string {
  return `${appUrl}/api/f/${formId}/submissions`;
}
