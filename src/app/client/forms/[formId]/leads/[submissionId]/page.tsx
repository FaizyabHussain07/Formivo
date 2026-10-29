import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LeadStatusBadge } from "@/components/submissions/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireClientForm } from "@/lib/auth/viewer";
import { AppError } from "@/lib/errors";
import { fieldLabel, formatDateTime, safeHttpUrl, toDisplayValue } from "@/lib/format";
import { getSubmissionForForm } from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Submission" };

export default async function Page({
  params,
}: {
  params: Promise<{ formId: string; submissionId: string }>;
}) {
  const { formId, submissionId } = await params;
  const { form } = await requireClientForm(formId);

  let submission;
  try {
    submission = await getSubmissionForForm(submissionId, formId);
  } catch (error) {
    if (error instanceof AppError && error.code === "LEAD_NOT_FOUND") notFound();
    throw error;
  }

  const entries = Object.entries(submission.data);
  const metadataEntries = Object.entries(submission.metadata);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/client/forms/${form.formId}/leads`}
        className="inline-flex w-fit items-center gap-1 text-sm text-foreground-secondary hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All leads
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Submission details
          </h1>
          <LeadStatusBadge status={submission.status} />
        </div>
        <p className="text-sm text-foreground-secondary">
          Received {formatDateTime(submission.createdAt)} · {form.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submitted data</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-foreground-muted">This submission has no fields.</p>
          ) : (
            <dl className="divide-y divide-border">
              {entries.map(([key, value]) => {
                const url = safeHttpUrl(value);
                const isComplex = typeof value === "object" && value !== null;
                return (
                  <div key={key} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="text-sm font-medium text-foreground-secondary">
                      {fieldLabel(key)}
                    </dt>
                    <dd className="min-w-0 text-sm text-foreground">
                      {isComplex ? (
                        <pre className="overflow-x-auto rounded-md bg-surface-muted p-2 font-mono text-xs whitespace-pre-wrap">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener nofollow"
                          className="break-all text-accent hover:underline"
                        >
                          {url}
                        </a>
                      ) : (
                        <span className="break-words whitespace-pre-wrap">
                          {toDisplayValue(value)}
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </CardContent>
      </Card>

      {metadataEntries.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-2 text-sm">
              {metadataEntries.map(([key, value]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="text-xs text-foreground-muted">{fieldLabel(key)}</dt>
                  <dd className="break-words text-foreground-secondary">{toDisplayValue(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
