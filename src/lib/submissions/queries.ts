import "server-only";

import { AppError } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

export const LEAD_STATUSES = [
  "new",
  "read",
  "contacted",
  "qualified",
  "converted",
  "archived",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  read: "Read",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  archived: "Archived",
};

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export type SubmissionRow = {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, Json>;
  metadata: Record<string, Json>;
  status: LeadStatus;
  sourceOrigin: string | null;
  createdAt: string;
  updatedAt: string;
};

type RawSubmission = {
  id: string;
  form_id: string;
  data: Json;
  metadata: Json;
  status: string;
  source_origin: string | null;
  created_at: string;
  updated_at: string;
};

function asRecord(value: Json): Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

function mapRow(row: RawSubmission, formNames: Map<string, string>): SubmissionRow {
  return {
    id: row.id,
    formId: row.form_id,
    formName: formNames.get(row.form_id) ?? "Unknown form",
    data: asRecord(row.data),
    metadata: asRecord(row.metadata),
    status: isLeadStatus(row.status) ? row.status : "new",
    sourceOrigin: row.source_origin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getWorkspaceFormNames(workspaceId: string): Promise<Map<string, string>> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select("id, name")
    .eq("workspace_id", workspaceId);
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  return new Map((data ?? []).map((form) => [form.id, form.name]));
}

export type ListSubmissionsParams = {
  workspaceId: string;
  formId?: string;
  status?: LeadStatus | "all";
  search?: string;
  page?: number;
  limit?: number;
  sort?: "newest" | "oldest";
};

export type ListSubmissionsResult = {
  items: SubmissionRow[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
};

function sanitizeSearch(value: string): string {
  return value
    .trim()
    .slice(0, 100)
    .replace(/[%,()*\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function listWorkspaceSubmissions(
  params: ListSubmissionsParams,
): Promise<ListSubmissionsResult> {
  const admin = requireAdminClient();
  const page = Math.max(1, Math.min(params.page ?? 1, 10_000));
  const limit = Math.max(1, Math.min(params.limit ?? 20, 100));

  const formNames = await getWorkspaceFormNames(params.workspaceId);
  if (formNames.size === 0) {
    return { items: [], total: 0, page, limit, hasNextPage: false };
  }

  let formIds = [...formNames.keys()];
  if (params.formId) {
    if (!formNames.has(params.formId)) throw new AppError("FORM_NOT_FOUND");
    formIds = [params.formId];
  }

  let query = admin
    .from("submissions")
    .select("id, form_id, data, metadata, status, source_origin, created_at, updated_at", {
      count: "exact",
    })
    .in("form_id", formIds);

  if (params.status && params.status !== "all") query = query.eq("status", params.status);

  const search = params.search ? sanitizeSearch(params.search) : "";
  if (search) {
    const term = `%${search}%`;
    query = query.or(
      [
        `data->>name.ilike.${term}`,
        `data->>email.ilike.${term}`,
        `data->>message.ilike.${term}`,
        `data->>subject.ilike.${term}`,
        `data->>phone.ilike.${term}`,
      ].join(","),
    );
  }

  query = query.order("created_at", { ascending: params.sort === "oldest" });

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  const total = count ?? 0;
  return {
    items: (data ?? []).map((row) => mapRow(row as RawSubmission, formNames)),
    total,
    page,
    limit,
    hasNextPage: from + limit < total,
  };
}

export async function getSubmissionForWorkspace(
  submissionId: string,
  workspaceId: string,
): Promise<SubmissionRow> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .select("id, form_id, data, metadata, status, source_origin, created_at, updated_at")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!data) throw new AppError("LEAD_NOT_FOUND");

  const { data: form, error: formError } = await admin
    .from("forms")
    .select("id, name, workspace_id")
    .eq("id", data.form_id)
    .maybeSingle();
  if (formError) throw new AppError("INTERNAL_ERROR", formError.message);
  if (!form || form.workspace_id !== workspaceId) throw new AppError("LEAD_NOT_FOUND");

  return mapRow(data as RawSubmission, new Map([[form.id, form.name]]));
}

export async function updateSubmissionStatus(input: {
  submissionId: string;
  workspaceId: string;
  userId: string;
  status: LeadStatus;
}): Promise<void> {
  const submission = await getSubmissionForWorkspace(input.submissionId, input.workspaceId);
  const admin = requireAdminClient();
  const { error } = await admin
    .from("submissions")
    .update({ status: input.status })
    .eq("id", input.submissionId);
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  await admin.from("audit_logs").insert({
    actor_user_id: input.userId,
    workspace_id: input.workspaceId,
    action: "submission.status_changed",
    target_type: "submission",
    target_id: input.submissionId,
    metadata: { from: submission.status, to: input.status },
  });
}

/** Submission scoped to a form whose access has already been authorized. */
export async function getSubmissionForForm(
  submissionId: string,
  formId: string,
): Promise<SubmissionRow> {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .select("id, form_id, data, metadata, status, source_origin, created_at, updated_at")
    .eq("id", submissionId)
    .eq("form_id", formId)
    .maybeSingle();
  if (error) throw new AppError("INTERNAL_ERROR", error.message);
  if (!data) throw new AppError("LEAD_NOT_FOUND");

  const { data: form } = await admin.from("forms").select("id, name").eq("id", formId).maybeSingle();
  return mapRow(data as RawSubmission, new Map(form ? [[form.id, form.name]] : []));
}

export async function getWorkspaceSubmissionStats(workspaceId: string): Promise<{
  total: number;
  newCount: number;
  thisMonth: number;
  latest: SubmissionRow[];
}> {
  const admin = requireAdminClient();
  const formNames = await getWorkspaceFormNames(workspaceId);
  if (formNames.size === 0) return { total: 0, newCount: 0, thisMonth: 0, latest: [] };

  const formIds = [...formNames.keys()];
  const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));

  const [totalResult, newResult, monthResult, latestResult] = await Promise.all([
    admin.from("submissions").select("id", { count: "exact", head: true }).in("form_id", formIds),
    admin
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds)
      .eq("status", "new"),
    admin
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .in("form_id", formIds)
      .gte("created_at", monthStart.toISOString()),
    admin
      .from("submissions")
      .select("id, form_id, data, metadata, status, source_origin, created_at, updated_at")
      .in("form_id", formIds)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  for (const result of [totalResult, newResult, monthResult, latestResult]) {
    if (result.error) throw new AppError("INTERNAL_ERROR", result.error.message);
  }

  return {
    total: totalResult.count ?? 0,
    newCount: newResult.count ?? 0,
    thisMonth: monthResult.count ?? 0,
    latest: (latestResult.data ?? []).map((row) =>
      mapRow(row as RawSubmission, formNames),
    ),
  };
}
