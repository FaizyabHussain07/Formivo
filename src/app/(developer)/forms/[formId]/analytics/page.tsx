import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnalyticsView } from "@/components/analytics/analytics-view";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getAnalytics, type AnalyticsRange } from "@/lib/analytics";
import { AppError } from "@/lib/errors";
import { getOwnedForm } from "@/lib/forms/service";

export const metadata: Metadata = { title: "Form analytics" };

type SearchParams = Promise<{ range?: string }>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: SearchParams;
}) {
  const [{ formId }, sp] = await Promise.all([params, searchParams]);
  const developer = await requireDeveloper();

  try {
    await getOwnedForm(formId, developer.workspace.id);
  } catch (error) {
    if (error instanceof AppError && error.code === "FORM_NOT_FOUND") notFound();
    throw error;
  }

  const days: AnalyticsRange = sp.range === "7" ? 7 : sp.range === "90" ? 90 : 30;
  const analytics = await getAnalytics({
    workspaceId: developer.workspace.id,
    formId,
    rangeDays: days,
  });

  return (
    <AnalyticsView
      analytics={analytics}
      basePath="/forms"
      rangeHref={(range) => `/forms/${formId}/analytics?range=${range}`}
    />
  );
}
