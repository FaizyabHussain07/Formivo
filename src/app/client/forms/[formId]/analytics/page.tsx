import type { Metadata } from "next";

import { AnalyticsView } from "@/components/analytics/analytics-view";
import { getAnalytics, type AnalyticsRange } from "@/lib/analytics";
import { requireClientForm } from "@/lib/auth/viewer";
import { getFormWorkspaceId } from "@/lib/forms/service";

export const metadata: Metadata = { title: "Shared form analytics" };

type SearchParams = Promise<{ range?: string }>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: SearchParams;
}) {
  const [{ formId }, sp] = await Promise.all([params, searchParams]);
  await requireClientForm(formId);
  const workspaceId = await getFormWorkspaceId(formId);

  const days: AnalyticsRange = sp.range === "7" ? 7 : sp.range === "90" ? 90 : 30;
  const analytics = await getAnalytics({ workspaceId, formId, rangeDays: days });

  return (
    <AnalyticsView
      analytics={analytics}
      basePath="/client/forms"
      rangeHref={(range) => `/client/forms/${formId}/analytics?range=${range}`}
    />
  );
}
