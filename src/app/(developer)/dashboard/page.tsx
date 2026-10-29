import { ArrowRight, ArrowUpRight, FileText, Inbox, Plus, Sparkles, Users } from "lucide-react";
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
import { getPublicEnv } from "@/lib/env/public";
import { formSubmissionEndpoint, listFormsWithCounts } from "@/lib/forms/service";
import { getWorkspaceSubmissionStats } from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Overview" };

export default async function Page() {
  const developer = await requireDeveloper();
  const [forms, stats] = await Promise.all([
    listFormsWithCounts(developer.workspace.id),
    getWorkspaceSubmissionStats(developer.workspace.id),
  ]);
  const entitlements = developer.entitlements;
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${developer.user.displayName.split(" ")[0]}`}
        description={`${developer.workspace.name} · ${developer.plan.name} plan`}
        actions={
          <>
            <ButtonLink href="/docs" variant="secondary">
              Docs
            </ButtonLink>
            <ButtonLink href="/forms/new">
              <Plus aria-hidden="true" />
              New form
            </ButtonLink>
          </>
        }
      />

      {forms.length === 0 ? (
        <section
          aria-labelledby="onboarding-heading"
          className="hero-grid surface-ring overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 text-xs font-medium text-accent-hover">
            <Sparkles className="size-3.5" aria-hidden="true" />
            First run
          </span>
          <h2
            id="onboarding-heading"
            className="mt-4 text-2xl font-semibold tracking-tight text-foreground"
          >
            Get your first submission in under five minutes
          </h2>
          <p className="mt-1 max-w-xl text-sm text-foreground-secondary">
            Formivo works with the form you already have. There is no builder to learn and no API
            key to manage.
          </p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              "Create a form and copy its public endpoint.",
              "Point your existing form — or a server route — at the endpoint.",
              "Review leads here, and invite your client read-only access.",
            ].map((step, index) => (
              <li
                key={step}
                className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-semibold text-accent">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground-secondary">{step}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink href="/forms/new">
              Create your first form
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/docs" variant="secondary">
              Read the docs
            </ButtonLink>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active forms"
          value={entitlements.activeFormCount}
          icon={FileText}
          hint={`${developer.plan.forms} allowed on ${developer.plan.name}`}
        />
        <StatCard
          label="Submissions this month"
          value={stats.thisMonth.toLocaleString("en-US")}
          icon={Inbox}
          hint={`of ${developer.plan.monthlyLeads.toLocaleString("en-US")} monthly`}
        />
        <StatCard label="Total leads" value={stats.total.toLocaleString("en-US")} hint="All time" />
        <StatCard
          label="New leads"
          value={stats.newCount.toLocaleString("en-US")}
          hint="Waiting for review"
        />
      </div>

      {entitlements.monthlyUsage >= entitlements.plan.monthlyLeads ? (
        <Alert tone="error" title="Monthly submission limit reached">
          New submissions are being rejected for the rest of this billing month. Upgrade on the
          billing page to keep receiving leads.
        </Alert>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="usage-heading"
          className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(11_31_28/0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="usage-heading" className="text-[15px] font-semibold text-foreground">
              Monthly usage
            </h2>
            <Link
              href="/billing"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              Manage plan <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-5">
            <UsageBar
              used={entitlements.monthlyUsage}
              limit={entitlements.plan.monthlyLeads}
              label={`${entitlements.plan.name} submissions`}
            />
          </div>
        </section>

        <section
          aria-labelledby="access-heading"
          className="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(11_31_28/0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="access-heading" className="text-[15px] font-semibold text-foreground">
              Client viewers
            </h2>
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-subtle text-accent">
              <Users className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-3 text-sm text-foreground-secondary">
            {entitlements.viewerCount} of {entitlements.plan.viewers} client viewers in use.
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Invite a client to read one form&apos;s leads without exposing the rest of your account.
          </p>
          <Link
            href="/clients"
            className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-accent hover:underline"
          >
            Manage client access <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2
            id="recent-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase"
          >
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
          <h2
            id="forms-heading"
            className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase"
          >
            Your forms
          </h2>
          <Link href="/forms" className="text-sm font-medium text-accent hover:underline">
            Manage forms
          </Link>
        </div>
        {forms.length > 0 ? (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(11_31_28/0.04)]">
            {forms.slice(0, 5).map((form) => (
              <li
                key={form.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-surface-muted/40"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Link
                    href={`/forms/${form.id}`}
                    className="truncate text-sm font-medium text-foreground hover:text-accent"
                  >
                    {form.name}
                  </Link>
                  <span className="truncate font-mono text-[11px] text-foreground-muted">
                    {formSubmissionEndpoint(appUrl, form.id).replace(/^https?:\/\//, "")}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                  <span>
                    {form.submissionCount} submissions · {form.newCount} new
                  </span>
                  <FormStatusBadge status={form.status} />
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
