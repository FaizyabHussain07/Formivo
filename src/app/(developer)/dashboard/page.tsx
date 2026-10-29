import { ArrowRight, FileText, Inbox, Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FormStatusBadge } from "@/components/submissions/status-badge";
import { SubmissionTable } from "@/components/submissions/submission-table";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, UsageBar } from "@/components/ui/stat-card";
import { requireDeveloper } from "@/lib/auth/viewer";
import { listFormsWithCounts } from "@/lib/forms/service";
import { getWorkspaceSubmissionStats } from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Overview" };

export default async function Page() {
  const developer = await requireDeveloper();
  const [forms, stats] = await Promise.all([
    listFormsWithCounts(developer.workspace.id),
    getWorkspaceSubmissionStats(developer.workspace.id),
  ]);
  const entitlements = developer.entitlements;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Welcome back, ${developer.user.displayName.split(" ")[0]}`}
        description={`${developer.workspace.name} · ${developer.plan.name} plan`}
        actions={
          <ButtonLink href="/forms/new">
            <Plus aria-hidden="true" />
            New form
          </ButtonLink>
        }
      />

      {forms.length === 0 ? (
        <section
          aria-labelledby="onboarding-heading"
          className="rounded-lg border border-border bg-surface p-6"
        >
          <h2 id="onboarding-heading" className="text-lg font-semibold text-foreground">
            Get your first submission in under five minutes
          </h2>
          <ol className="mt-4 flex flex-col gap-3 text-sm text-foreground-secondary">
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent">
                1
              </span>
              Create a form and copy its public endpoint.
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent">
                2
              </span>
              Point your existing form — or a server route — at the endpoint.
            </li>
            <li className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent">
                3
              </span>
              Review leads here, and invite your client read-only access.
            </li>
          </ol>
          <div className="mt-5">
            <ButtonLink href="/forms/new">Create your first form</ButtonLink>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active forms" value={entitlements.activeFormCount} icon={FileText} />
        <StatCard
          label="Submissions this month"
          value={stats.thisMonth.toLocaleString("en-US")}
          icon={Inbox}
        />
        <StatCard label="Total leads" value={stats.total.toLocaleString("en-US")} />
        <StatCard
          label="New leads"
          value={stats.newCount.toLocaleString("en-US")}
          hint="Waiting for review"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="usage-heading"
          className="rounded-lg border border-border bg-surface p-5"
        >
          <h2 id="usage-heading" className="text-base font-semibold text-foreground">
            Monthly usage
          </h2>
          <div className="mt-4">
            <UsageBar
              used={entitlements.monthlyUsage}
              limit={entitlements.plan.monthlyLeads}
              label={`${entitlements.plan.name} submissions`}
            />
          </div>
        </section>

        <section
          aria-labelledby="access-heading"
          className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="access-heading" className="text-base font-semibold text-foreground">
              Client viewers
            </h2>
            <Users className="size-4 text-foreground-muted" aria-hidden="true" />
          </div>
          <p className="text-sm text-foreground-secondary">
            {entitlements.viewerCount} of {entitlements.plan.viewers} client viewers in use.
          </p>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Manage client access <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      {entitlements.monthlyUsage >= entitlements.plan.monthlyLeads ? (
        <Alert tone="error" title="Monthly submission limit reached">
          New submissions are being rejected for the rest of this billing month. Upgrade on the
          billing page to keep receiving leads.
        </Alert>
      ) : null}

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="recent-heading" className="text-base font-semibold text-foreground">
            Recent leads
          </h2>
          <Link href="/submissions" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        {stats.latest.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No submissions yet"
            description="Send a test submission from a form's Integration tab to see the full flow, or connect your website form."
            action={
              forms.length > 0 ? <ButtonLink href="/forms">Open your forms</ButtonLink> : null
            }
          />
        ) : (
          <SubmissionTable
            items={stats.latest}
            showForm
            hrefFor={(submission) => `/submissions/${submission.id}`}
          />
        )}
      </section>

      <section aria-labelledby="forms-heading" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="forms-heading" className="text-base font-semibold text-foreground">
            Your forms
          </h2>
          <Link href="/forms" className="text-sm font-medium text-accent hover:underline">
            Manage forms
          </Link>
        </div>
        {forms.length > 0 ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {forms.slice(0, 5).map((form) => (
              <li key={form.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={`/forms/${form.id}`}
                    className="truncate font-medium text-foreground hover:text-accent"
                  >
                    {form.name}
                  </Link>
                  <span className="text-xs text-foreground-muted">
                    {form.submissionCount} submissions · {form.newCount} new
                  </span>
                </div>
                <FormStatusBadge status={form.status} />
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
