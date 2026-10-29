import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SubmissionTable } from "@/components/submissions/submission-table";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { getAnalytics } from "@/lib/analytics";
import { requireClientForm } from "@/lib/auth/viewer";
import { getFormWorkspaceId } from "@/lib/forms/service";
import { listWorkspaceSubmissions } from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Shared form" };

export default async function Page({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const { form } = await requireClientForm(formId);
  const workspaceId = await getFormWorkspaceId(formId);

  const [recent, analytics] = await Promise.all([
    listWorkspaceSubmissions({ workspaceId, formId, limit: 5 }),
    getAnalytics({ workspaceId, formId, rangeDays: 30 }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Submissions (30 days)" value={analytics.total.toLocaleString("en-US")} />
        <StatCard label="New" value={analytics.byStatus.new} hint="Waiting for review" />
        <StatCard label="Qualified" value={analytics.byStatus.qualified} />
      </div>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="recent-heading" className="text-base font-semibold text-foreground">
            Recent submissions
          </h2>
          <Link
            href={`/client/forms/${form.formId}/leads`}
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        {recent.items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No submissions yet"
            description="New leads appear here as soon as the form receives them."
          />
        ) : (
          <SubmissionTable
            items={recent.items}
            hrefFor={(submission) => `/client/forms/${form.formId}/leads/${submission.id}`}
          />
        )}
      </section>
    </div>
  );
}
