import Link from "next/link";
import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { formatRelative, submissionSummary, truncate } from "@/lib/format";
import type { SubmissionRow } from "@/lib/submissions/queries";

import { LeadStatusBadge } from "./status-badge";

export function SubmissionTable({
  items,
  showForm = false,
  hrefFor,
}: {
  items: SubmissionRow[];
  showForm?: boolean;
  hrefFor?: (submission: SubmissionRow) => string;
}) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Contact</TableHeaderCell>
          {showForm ? <TableHeaderCell>Form</TableHeaderCell> : null}
          <TableHeaderCell>Preview</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="text-right">Received</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((submission) => {
          const summary = submissionSummary(submission.data);
          const href = hrefFor?.(submission);

          return (
            <TableRow key={submission.id}>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">
                    {summary.name ?? summary.email ?? "Unnamed submission"}
                  </span>
                  {summary.name && summary.email ? (
                    <span className="text-xs text-foreground-muted">{summary.email}</span>
                  ) : null}
                </div>
              </TableCell>
              {showForm ? (
                <TableCell className="whitespace-nowrap">{submission.formName}</TableCell>
              ) : null}
              <TableCell>
                {href ? (
                  <Link href={href} className="text-accent hover:underline">
                    {truncate(preview(submission.data), 60)}
                  </Link>
                ) : (
                  truncate(preview(submission.data), 60)
                )}
              </TableCell>
              <TableCell>
                <LeadStatusBadge status={submission.status} />
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <time dateTime={submission.createdAt}>{formatRelative(submission.createdAt)}</time>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function preview(data: Record<string, unknown>): string {
  const priority = ["message", "subject", "company", "phone", "email", "name"];
  for (const key of priority) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  const first = Object.values(data).find((value) => typeof value === "string");
  return typeof first === "string" ? first : JSON.stringify(data);
}

export function Pagination({
  page,
  hasNextPage,
  total,
  limit,
  hrefFor,
}: {
  page: number;
  hasNextPage: boolean;
  total: number;
  limit: number;
  hrefFor: (page: number) => string;
}) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 text-sm text-foreground-secondary sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        Showing {from}–{to} of {total.toLocaleString("en-US")}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <PagerLink href={hrefFor(page - 1)}>Previous</PagerLink>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-foreground-muted opacity-50">
            Previous
          </span>
        )}
        {hasNextPage ? (
          <PagerLink href={hrefFor(page + 1)}>Next</PagerLink>
        ) : (
          <span className="rounded-md border border-border px-3 py-1.5 text-foreground-muted opacity-50">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}

function PagerLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-border bg-surface px-3 py-1.5 text-foreground transition-colors hover:bg-surface-muted"
    >
      {children}
    </Link>
  );
}
