import type { Metadata } from "next";

import { AnalyticsView } from "@/components/analytics/analytics-view";
import { PageHeader } from "@/components/ui/page-header";
import { getAnalytics, type AnalyticsRange } from "@/lib/analytics";
import { requireDeveloper } from "@/lib/auth/viewer";

export const metadata: Metadata = { title: "Analytics" };

type SearchParams = Promise<{ range?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const developer = await requireDeveloper();
  const sp = await searchParams;
  const days: AnalyticsRange = sp.range === "7" ? 7 : sp.range === "90" ? 90 : 30;

  const analytics = await getAnalytics({
    workspaceId: developer.workspace.id,
    rangeDays: days,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Submission volume and lead status across every form in your workspace."
      />
      <AnalyticsView
        analytics={analytics}
        basePath="/forms"
        rangeHref={(range) => `/analytics?range=${range}`}
      />
    </div>
  );
}
