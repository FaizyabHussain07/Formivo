import { FileText, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FormStatusBadge } from "@/components/submissions/status-badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getPublicEnv } from "@/lib/env/public";
import { formatDate } from "@/lib/format";
import { formSubmissionEndpoint, listFormsWithCounts } from "@/lib/forms/service";

export const metadata: Metadata = { title: "Forms" };

export default async function Page() {
  const developer = await requireDeveloper();
  const forms = await listFormsWithCounts(developer.workspace.id);
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Workspace"
        title="Forms"
        description={`${developer.entitlements.activeFormCount} of ${developer.plan.forms} active forms on the ${developer.plan.name} plan. Every form has one public endpoint.`}
        actions={
          <ButtonLink href="/forms/new">
            <Plus aria-hidden="true" />
            New form
          </ButtonLink>
        }
      />

      {forms.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Create your first form"
          description="Each form gets a public submission endpoint you can connect to an existing HTML form or any HTTP client. No API key required."
          action={<ButtonLink href="/forms/new">Create a form</ButtonLink>}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Form</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Submissions</TableHeaderCell>
              <TableHeaderCell className="text-right">New</TableHeaderCell>
              <TableHeaderCell className="text-right">Created</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/forms/${form.id}`}
                      className="font-medium text-foreground hover:text-accent"
                    >
                      {form.name}
                    </Link>
                    <span className="max-w-md truncate font-mono text-[11px] text-foreground-muted">
                      {formSubmissionEndpoint(appUrl, form.id).replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <FormStatusBadge status={form.status} />
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {form.submissionCount}
                </TableCell>
                <TableCell className="text-right">{form.newCount}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatDate(form.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
