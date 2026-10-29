import "server-only";

import { AppError } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";

import { LEAD_STATUSES, isLeadStatus, type LeadStatus } from "./submissions/queries";

export type AnalyticsRange = 7 | 30 | 90;

export type AnalyticsResult = {
  rangeDays: AnalyticsRange;
  start: string;
  end: string;
  total: number;
  byStatus: Record<LeadStatus, number>;
  daily: { date: string; count: number }[];
  byForm: { formId: string; name: string; count: number }[];
};

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getAnalytics(input: {
  workspaceId: string;
  formId?: string;
  rangeDays?: AnalyticsRange;
}): Promise<AnalyticsResult> {
  const admin = requireAdminClient();
  const rangeDays: AnalyticsRange = input.rangeDays ?? 30;

  const { data: forms, error: formsError } = await admin
    .from("forms")
    .select("id, name")
    .eq("workspace_id", input.workspaceId);
  if (formsError) throw new AppError("INTERNAL_ERROR", formsError.message);

  const names = new Map((forms ?? []).map((form) => [form.id, form.name]));
  if (input.formId && !names.has(input.formId)) throw new AppError("FORM_NOT_FOUND");

  const formIds = input.formId ? [input.formId] : [...names.keys()];
  const end = new Date();
  const start = startOfUtcDay(new Date(end.getTime() - (rangeDays - 1) * 86_400_000));

  if (formIds.length === 0) {
    return {
      rangeDays,
      start: start.toISOString(),
      end: end.toISOString(),
      total: 0,
      byStatus: Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<
        LeadStatus,
        number
      >,
      daily: buildDailySeries(start, end).map((date) => ({ date, count: 0 })),
      byForm: [],
    };
  }

  const { data, error } = await admin
    .from("submissions")
    .select("form_id, status, created_at")
    .in("form_id", formIds)
    .gte("created_at", start.toISOString());
  if (error) throw new AppError("INTERNAL_ERROR", error.message);

  const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<
    LeadStatus,
    number
  >;
  const dailyCounts = new Map<string, number>();
  const formCounts = new Map<string, number>();

  for (const row of data ?? []) {
    if (isLeadStatus(row.status)) byStatus[row.status] += 1;
    const day = row.created_at.slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
    formCounts.set(row.form_id, (formCounts.get(row.form_id) ?? 0) + 1);
  }

  return {
    rangeDays,
    start: start.toISOString(),
    end: end.toISOString(),
    total: data?.length ?? 0,
    byStatus,
    daily: buildDailySeries(start, end).map((date) => ({
      date,
      count: dailyCounts.get(date) ?? 0,
    })),
    byForm: formIds
      .map((formId) => ({
        formId,
        name: names.get(formId) ?? "Unknown form",
        count: formCounts.get(formId) ?? 0,
      }))
      .sort((a, b) => b.count - a.count),
  };
}

function buildDailySeries(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const cursor = startOfUtcDay(start);
  const last = startOfUtcDay(end);
  while (cursor <= last && dates.length < 120) {
    dates.push(isoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}
