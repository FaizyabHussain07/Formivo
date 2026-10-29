import { Inbox, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Pagination, SubmissionTable } from "@/components/submissions/submission-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { requireDeveloper } from "@/lib/auth/viewer";
import { listForms } from "@/lib/forms/service";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  isLeadStatus,
  listWorkspaceSubmissions,
} from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Submissions" };

type SearchParams = Promise<{ page?: string; status?: string; q?: string; form?: string }>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const developer = await requireDeveloper();
  const sp = await searchParams;
  const forms = await listForms(developer.workspace.id);

  const page = Number.parseInt(sp.page ?? "1", 10);
  const status = sp.status && isLeadStatus(sp.status) ? sp.status : "all";
  const search = typeof sp.q === "string" ? sp.q : "";
  const formId = forms.some((form) => form.id === sp.form) ? sp.form : undefined;

  const result = await listWorkspaceSubmissions({
    workspaceId: developer.workspace.id,
    formId,
    page: Number.isFinite(page) ? page : 1,
    status,
    search,
  });

  function hrefFor(targetPage: number) {
    const query = new URLSearchParams();
    if (status !== "all") query.set("status", status);
    if (search) query.set("q", search);
    if (formId) query.set("form", formId);
    if (targetPage > 1) query.set("page", String(targetPage));
    const suffix = query.toString();
    return `/submissions${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Workspace"
        title="Submissions"
        description={`${result.total.toLocaleString("en-US")} leads across your workspace.`}
        actions={
          <Link
            href="/forms/new"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground shadow-[0_1px_2px_rgb(11_31_28/0.04)] transition-colors hover:bg-surface-muted"
          >
            New form
          </Link>
        }
      />

      <form
        method="get"
        className="grid gap-2 rounded-xl border border-border bg-surface p-3 shadow-[0_1px_2px_rgb(11_31_28/0.04)] sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="relative">
          <label htmlFor="submission-search" className="sr-only">
            Search submissions
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden="true"
          />
          <Input
            id="submission-search"
            name="q"
            defaultValue={search}
            placeholder="Search name, email or message…"
            className="pl-9"
          />
        </div>
        <div>
          <label htmlFor="submission-form" className="sr-only">
            Filter by form
          </label>
          <Select id="submission-form" name="form" defaultValue={formId ?? ""}>
            <option value="">All forms</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="submission-status" className="sr-only">
            Filter by status
          </label>
          <Select id="submission-status" name="status" defaultValue={status}>
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground shadow-[0_1px_2px_rgb(15_118_110/0.25)] transition-colors hover:bg-accent-hover"
        >
          Filter
        </button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            search || status !== "all" || formId ? "No matching submissions" : "No submissions yet"
          }
          description={
            search || status !== "all" || formId
              ? "Try clearing filters or searching for something else."
              : "Once your forms receive submissions, they appear here with full contact details."
          }
        />
      ) : (
        <>
          <SubmissionTable
            items={result.items}
            showForm
            hrefFor={(submission) => `/submissions/${submission.id}`}
          />
          <Pagination
            page={result.page}
            hasNextPage={result.hasNextPage}
            total={result.total}
            limit={result.limit}
            hrefFor={hrefFor}
          />
        </>
      )}
    </div>
  );
}
