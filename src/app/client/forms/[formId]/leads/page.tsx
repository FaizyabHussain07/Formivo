import { Inbox } from "lucide-react";
import type { Metadata } from "next";

import { Pagination, SubmissionTable } from "@/components/submissions/submission-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { requireClientForm } from "@/lib/auth/viewer";
import { getFormWorkspaceId } from "@/lib/forms/service";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  isLeadStatus,
  listWorkspaceSubmissions,
} from "@/lib/submissions/queries";

export const metadata: Metadata = { title: "Shared form leads" };

type SearchParams = Promise<{ page?: string; status?: string; q?: string }>;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: SearchParams;
}) {
  const [{ formId }, sp] = await Promise.all([params, searchParams]);
  await requireClientForm(formId);
  const workspaceId = await getFormWorkspaceId(formId);

  const page = Number.parseInt(sp.page ?? "1", 10);
  const status = sp.status && isLeadStatus(sp.status) ? sp.status : "all";
  const search = typeof sp.q === "string" ? sp.q : "";

  const result = await listWorkspaceSubmissions({
    workspaceId,
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
    return `/client/forms/${formId}/leads${suffix ? `?${suffix}` : ""}`;
  }

  return (
    <div className="flex flex-col gap-5">
      <form method="get" className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="client-search" className="sr-only">
            Search submissions
          </label>
          <Input
            id="client-search"
            name="q"
            defaultValue={search}
            placeholder="Search name, email or message…"
          />
        </div>
        <div>
          <label htmlFor="client-status" className="sr-only">
            Filter by status
          </label>
          <Select id="client-status" name="status" defaultValue={status} className="sm:w-44">
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
          className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Filter
        </button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={search || status !== "all" ? "No matching submissions" : "No submissions yet"}
          description={
            search || status !== "all"
              ? "Try a different search or status."
              : "Leads appear here as soon as the form receives them."
          }
        />
      ) : (
        <>
          <SubmissionTable
            items={result.items}
            hrefFor={(submission) => `/client/forms/${formId}/leads/${submission.id}`}
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
