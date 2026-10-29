import { Inbox, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SubmissionTable, Pagination } from "@/components/submissions/submission-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { requireDeveloper } from "@/lib/auth/viewer";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, isLeadStatus, listWorkspaceSubmissions } from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Leads" };

type SearchParams = Promise<{ page?: string; status?: string; q?: string }>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: SearchParams;
}) {
  const [{ formId }, sp] = await Promise.all([params, searchParams]);
  const developer = await requireDeveloper();

  const page = Number.parseInt(sp.page ?? "1", 10);
  const status = sp.status && isLeadStatus(sp.status) ? sp.status : "all";
  const search = typeof sp.q === "string" ? sp.q : "";

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
    if (targetPage > 1) query.set("page", String(targetPage));
    const suffix = query.toString();
    return `/forms/${formId}/leads${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-5">
      <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="lead-search" className="sr-only">
          Search leads
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-muted"
            aria-hidden="true"
          />
          <Input
            id="lead-search"
            name="q"
            defaultValue={search}
            placeholder="Search name, email, message…"
            className="pl-9"
          />
        </div>
        <label htmlFor="lead-status" className="sr-only">
          Filter by status
        </label>
        <Select id="lead-status" name="status" defaultValue={status} className="sm:w-44">
          <option value="all">All statuses</option>
          {LEAD_STATUSES.map((value) => (
            <option key={value} value={value}>
              {LEAD_STATUS_LABELS[value]}
            </option>
          ))}
        </Select>
        {search || status !== "all" ? (
          <Link
            href={`/forms/${formId}/leads`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-3 text-sm text-foreground-secondary hover:bg-surface-muted"
          >
            Reset
          </Link>
        ) : null}
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Filter
        </button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={search || status !== "all" ? "No matching leads" : "No leads yet"}
          description={
            search || status !== "all"
              ? "Try a different search or status. Filters do not change the underlying data."
              : "Leads appear here as soon as your form's endpoint receives a submission."
          }
        />
      ) : (
        <>
          <SubmissionTable items={result.items} hrefFor={(item) => `/submissions/${item.id}`} />
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
