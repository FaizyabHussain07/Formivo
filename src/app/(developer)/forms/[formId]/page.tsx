import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FormSettings } from "@/components/forms/form-settings";
import { SubmissionTable } from "@/components/submissions/submission-table";
import { Alert } from "@/components/ui/alert";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getPublicEnv } from "@/lib/env/public";
import { AppError } from "@/lib/errors";
import { formSubmissionEndpoint, getOwnedForm } from "@/lib/forms/service";
import { listWorkspaceSubmissions } from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Form overview" };

export default async function Page({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const developer = await requireDeveloper();

  let form;
  try {
    form = await getOwnedForm(formId, developer.workspace.id);
  } catch (error) {
    if (error instanceof AppError && error.code === "FORM_NOT_FOUND") notFound();
    throw error;
  }

  const recent = await listWorkspaceSubmissions({
    workspaceId: developer.workspace.id,
    formId,
    limit: 5,
  });
  const endpoint = formSubmissionEndpoint(getPublicEnv().NEXT_PUBLIC_APP_URL, form.id);

  return (
    <div className="flex flex-col gap-8">
      {form.status !== "active" ? (
        <Alert tone="warning" title="This form is paused">
          It keeps its leads and history, but the submission endpoint rejects new requests until you
          resume it.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total leads" value={recent.total.toLocaleString("en-US")} />
        <StatCard
          label="New leads"
          value={recent.items.filter((item) => item.status === "new").length}
          hint="In the five most recent"
        />
        <StatCard
          label="Secret"
          value={form.hasSecret ? `••••${form.secretLastFour ?? "••••"}` : "Not set"}
          hint={form.hasSecret ? "Rotate from Integration" : "Generate one to accept submissions"}
        />
      </div>

      <section aria-labelledby="endpoint-heading" className="flex flex-col gap-3">
        <h2 id="endpoint-heading" className="text-base font-semibold text-foreground">
          Submission endpoint
        </h2>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
          <code className="min-w-0 overflow-x-auto font-mono text-xs text-foreground-secondary">
            POST {endpoint}
          </code>
          <CopyButton value={endpoint} label="Copy endpoint" />
        </div>
      </section>

      <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="recent-heading" className="text-base font-semibold text-foreground">
            Recent leads
          </h2>
          <Link
            href={`/forms/${form.id}/leads`}
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        {recent.items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No submissions yet"
            description="Send a test submission from the Integration tab, or point your existing form at the endpoint."
          />
        ) : (
          <SubmissionTable
            items={recent.items}
            hrefFor={(submission) => `/submissions/${submission.id}`}
          />
        )}
      </section>

      <section aria-labelledby="settings-heading" className="flex flex-col gap-4">
        <h2 id="settings-heading" className="text-base font-semibold text-foreground">
          Form details
        </h2>
        <div className="rounded-lg border border-border bg-surface p-5">
          <FormSettings
            formId={form.id}
            name={form.name}
            description={form.description}
            notificationEmail={form.notificationEmail}
          />
        </div>
      </section>
    </div>
  );
}
