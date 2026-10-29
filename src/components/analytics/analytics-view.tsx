import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import type { AnalyticsResult } from "@/lib/analytics";
import { formatDate } from "@/lib/format";
import { LEAD_STATUS_LABELS, LEAD_STATUSES } from "@/lib/submissions/queries";

export function AnalyticsView({
  analytics,
  basePath,
  rangeHref,
}: {
  analytics: AnalyticsResult;
  basePath: string;
  rangeHref: (days: number) => string;
}) {
  const maxDaily = Math.max(1, ...analytics.daily.map((day) => day.count));
  const converted = analytics.byStatus.converted;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Date range">
        {[7, 30, 90].map((days) => (
          <Link
            key={days}
            href={rangeHref(days)}
            className={
              analytics.rangeDays === days
                ? "rounded-md border border-accent bg-accent-subtle px-3 py-1.5 text-sm font-medium text-accent-hover"
                : "rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
            }
          >
            Last {days} days
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Submissions" value={analytics.total.toLocaleString("en-US")} hint={`Last ${analytics.rangeDays} days`} />
        <StatCard label="New" value={analytics.byStatus.new.toLocaleString("en-US")} hint="Waiting for review" />
        <StatCard label="Qualified" value={analytics.byStatus.qualified.toLocaleString("en-US")} hint="Marked qualified" />
        <StatCard label="Converted" value={converted.toLocaleString("en-US")} hint="Closed as a customer" />
      </div>

      <section aria-labelledby="volume-heading" className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-1">
          <h2 id="volume-heading" className="text-base font-semibold text-foreground">
            Submissions per day
          </h2>
          <p className="text-sm text-foreground-secondary">
            {formatDate(analytics.start)} – {formatDate(analytics.end)}
          </p>
        </div>
        {analytics.total === 0 ? (
          <p className="mt-6 text-sm text-foreground-muted">
            No submissions in this period yet. Daily volume appears here as leads arrive.
          </p>
        ) : (
          <div
            className="mt-5 flex h-40 items-end gap-1 overflow-hidden"
            role="img"
            aria-label={`Daily submissions chart, highest day ${maxDaily}`}
          >
            {analytics.daily.map((day) => (
              <div
                key={day.date}
                className="group relative flex min-w-1 flex-1 flex-col justify-end"
                title={`${day.date}: ${day.count}`}
              >
                <div
                  className="w-full rounded-t-sm bg-accent/70 transition-colors group-hover:bg-accent"
                  style={{ height: `${Math.max(day.count === 0 ? 1 : 4, (day.count / maxDaily) * 100)}%` }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-2 flex justify-between text-xs text-foreground-muted">
          <span>{analytics.daily[0]?.date}</span>
          <span>{analytics.daily.at(-1)?.date}</span>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="status-heading" className="rounded-lg border border-border bg-surface p-5">
          <h2 id="status-heading" className="text-base font-semibold text-foreground">
            Lead status
          </h2>
          {analytics.total === 0 ? (
            <p className="mt-4 text-sm text-foreground-muted">No submissions in this period.</p>
          ) : (
            <dl className="mt-4 flex flex-col gap-3">
              {LEAD_STATUSES.map((status) => {
                const count = analytics.byStatus[status];
                const pct = analytics.total === 0 ? 0 : Math.round((count / analytics.total) * 100);
                return (
                  <div key={status} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm text-foreground-secondary">
                        {LEAD_STATUS_LABELS[status]}
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {count} <span className="text-xs font-normal text-foreground-muted">({pct}%)</span>
                      </dd>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </dl>
          )}
        </section>

        <section aria-labelledby="forms-heading" className="rounded-lg border border-border bg-surface p-5">
          <h2 id="forms-heading" className="text-base font-semibold text-foreground">
            Forms
          </h2>
          {analytics.byForm.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No forms yet" description="Create a form to start collecting leads." />
            </div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Form</TableHeaderCell>
                    <TableHeaderCell className="text-right">Submissions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.byForm.map((form) => (
                    <TableRow key={form.formId}>
                      <TableCell>
                        <Link href={`${basePath}/${form.formId}`} className="text-accent hover:underline">
                          {form.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">{form.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
