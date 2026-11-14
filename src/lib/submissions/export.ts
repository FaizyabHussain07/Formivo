import "server-only";

import { getWorkspaceEntitlements } from "@/lib/billing/entitlements";
import { AppError } from "@/lib/errors";
import { hasActiveClientPermission } from "@/lib/authorization/ownership";
import { requireAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

const EXPORT_ROW_LIMIT = 10_000;
const MAX_DATA_COLUMNS = 40;

export type ExportScope =
  | { kind: "developer"; workspaceId: string; formId?: string }
  | { kind: "client"; formId: string; clientUserId: string };

type ExportRow = {
  id: string;
  form_id: string;
  data: Json;
  metadata: Json;
  status: string;
  source_origin: string | null;
  created_at: string;
};

function asRecord(value: Json): Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, Json>)
    : {};
}

/** RFC 4180 field escaping; also neutralises spreadsheet formula injection. */
export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const neutralised = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${neutralised.replace(/"/g, '""')}"`;
}

function columnKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_ .-]/g, "").slice(0, 60) || "field";
}

/**
 * CSV export for paid workspaces. The entitlement check runs here, on the server,
 * for developers and clients alike: a free workspace is refused even when the
 * request is crafted by hand, and a client may only export forms shared with them.
 */
export async function buildSubmissionsCsv(scope: ExportScope): Promise<{
  filename: string;
  csv: string;
  rowCount: number;
}> {
  const admin = requireAdminClient();
  let formIds: string[];
  let planAllowsExport = true;

  if (scope.kind === "developer") {
    const entitlements = await getWorkspaceEntitlements(scope.workspaceId);
    planAllowsExport = entitlements.canExportSubmissions;

    const { data: forms, error } = await admin
      .from("forms")
      .select("id")
      .eq("workspace_id", scope.workspaceId);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);

    const owned = (forms ?? []).map((form) => form.id);
    if (scope.formId && !owned.includes(scope.formId)) throw new AppError("FORM_NOT_FOUND");
    formIds = scope.formId ? [scope.formId] : owned;
  } else {
    const allowed = await hasActiveClientPermission(scope.formId, scope.clientUserId);
    if (!allowed) throw new AppError("FORBIDDEN");

    const { data: form, error } = await admin
      .from("forms")
      .select("id, workspace_id")
      .eq("id", scope.formId)
      .maybeSingle();
    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    if (!form) throw new AppError("FORM_NOT_FOUND");

    // Entitlement belongs to the workspace that owns the form, not to the viewer.
    const entitlements = await getWorkspaceEntitlements(form.workspace_id);
    planAllowsExport = entitlements.canExportSubmissions;
    formIds = [scope.formId];
  }

  if (!planAllowsExport) {
    throw new AppError(
      "PLAN_LIMIT_REACHED",
      "CSV export is available on the Light, Pro and Agency plans. Upgrade to export submissions.",
    );
  }

  if (formIds.length === 0) {
    return { filename: "formivo-submissions.csv", csv: "", rowCount: 0 };
  }

  const [{ data: rows, error: rowsError }, { data: forms, error: formsError }] = await Promise.all([
    admin
      .from("submissions")
      .select("id, form_id, data, metadata, status, source_origin, created_at")
      .in("form_id", formIds)
      .order("created_at", { ascending: false })
      .limit(EXPORT_ROW_LIMIT),
    admin.from("forms").select("id, name").in("id", formIds),
  ]);
  if (rowsError) throw new AppError("INTERNAL_ERROR", rowsError.message);
  if (formsError) throw new AppError("INTERNAL_ERROR", formsError.message);

  const formNames = new Map((forms ?? []).map((form) => [form.id, form.name]));
  const records = (rows ?? []) as ExportRow[];

  // Union of field names, in first-seen order, so the CSV is stable per export.
  const dataColumns: string[] = [];
  for (const row of records) {
    for (const key of Object.keys(asRecord(row.data))) {
      const column = columnKey(key);
      if (!dataColumns.includes(column) && dataColumns.length < MAX_DATA_COLUMNS) {
        dataColumns.push(column);
      }
    }
  }

  const header = [
    "submission_id",
    "form",
    "submitted_at",
    "status",
    "source_origin",
    ...dataColumns,
    "page_url",
  ];

  const lines = [header.map(csvCell).join(",")];
  for (const row of records) {
    const data = asRecord(row.data);
    const metadata = asRecord(row.metadata);
    const byColumn = new Map(Object.entries(data).map(([key, value]) => [columnKey(key), value]));
    lines.push(
      [
        row.id,
        formNames.get(row.form_id) ?? "Unknown form",
        row.created_at,
        row.status,
        row.source_origin ?? "",
        ...dataColumns.map((column) => byColumn.get(column) ?? ""),
        typeof metadata.page_url === "string" ? metadata.page_url : "",
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const scopeName =
    scope.formId && formNames.get(scope.formId)
      ? formNames.get(scope.formId)!
      : `workspace-${new Date().toISOString().slice(0, 10)}`;
  const filename = `formivo-${scopeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)}.csv`;

  return { filename, csv: `${lines.join("\r\n")}\r\n`, rowCount: records.length };
}

export async function recordExport(input: {
  actorUserId: string;
  workspaceId: string | null;
  formId: string | null;
  rowCount: number;
  subject: "developer" | "client";
}): Promise<void> {
  const admin = requireAdminClient();
  await admin.from("audit_logs").insert({
    actor_user_id: input.actorUserId,
    workspace_id: input.workspaceId,
    action: "submissions.exported",
    target_type: "form",
    target_id: input.formId,
    metadata: { rows: input.rowCount, subject: input.subject },
  });
}
