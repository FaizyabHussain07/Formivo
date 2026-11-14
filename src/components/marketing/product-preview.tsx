import { Bell, ChevronDown, FolderOpen, LayoutDashboard, Search, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "New leads", value: "12", hint: "Waiting for review" },
  { label: "This month", value: "148", hint: "of 2,000" },
  { label: "Client viewers", value: "4", hint: "of 10" },
];

const submissions = [
  {
    name: "Jordan Alvarez",
    email: "jordan@northside.co",
    preview: "Need a quote for a 6-page site.",
    status: "New",
    tone: "accent" as const,
    time: "2m",
  },
  {
    name: "Priya Raman",
    email: "priya@ramanlegal.com",
    preview: "Can we book a call this week?",
    status: "Contacted",
    tone: "warning" as const,
    time: "1h",
  },
  {
    name: "Tomas Lind",
    email: "tomas@lindstudio.se",
    preview: "Budget approved, sending the brief.",
    status: "Qualified",
    tone: "accent" as const,
    time: "3h",
  },
];

const sidebar = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Forms", icon: FolderOpen },
  { label: "Submissions", icon: Search },
  { label: "Client access", icon: Users },
];

/**
 * The hero product preview.
 *
 * It mirrors the real dashboard: workspace and form context, submission stats, a
 * searchable lead table, lead statuses and a scoped client view. Sample data is
 * labelled. Screen readers get one concise description instead of dozens of
 * decorative fragments.
 */
export function ProductPreview() {
  return (
    <figure className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -top-10 -bottom-16 -z-10 rounded-[3rem] bg-[radial-gradient(ellipse_at_50%_20%,rgb(43_217_196/0.18),transparent_65%)] blur-2xl"
      />

      <div aria-hidden="true" className="relative">
        <div className="preview-frame overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/70 px-3.5 py-2.5">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="size-2 rounded-full bg-border-strong" />
              <span className="size-2 rounded-full bg-border-strong" />
              <span className="size-2 rounded-full bg-border-strong" />
            </div>
            <p className="min-w-0 truncate rounded-md border border-border bg-surface px-3 py-0.5 font-mono text-[9.5px] text-foreground-muted">
              formivo.faizyab.me/dashboard
            </p>
            <Badge tone="neutral" className="shrink-0">
              Sample data
            </Badge>
          </div>

          <div className="grid sm:grid-cols-[8.75rem_1fr]">
            <aside className="hidden flex-col gap-4 border-r border-border bg-surface-muted/40 p-3 sm:flex">
              <div className="flex items-center gap-1.5">
                <span className="flex size-5 items-center justify-center rounded-md bg-brand-mint text-[8px] font-bold text-brand-ink">
                  F
                </span>
                <span className="text-[11px] font-semibold tracking-tight text-foreground">
                  Formivo
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                {sidebar.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] ${
                        item.active
                          ? "bg-accent-subtle font-medium text-accent-hover"
                          : "text-foreground-secondary"
                      }`}
                    >
                      <Icon className="size-3" />
                      {item.label}
                    </span>
                  );
                })}
              </div>

              <div className="mt-auto rounded-lg border border-border bg-surface p-2.5">
                <p className="text-[9px] font-medium tracking-wide text-foreground-muted uppercase">
                  Pro plan
                </p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full w-[37%] rounded-full bg-accent" />
                </div>
                <p className="mt-1.5 font-mono text-[8.5px] text-foreground-muted">740 / 2,000</p>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3.5 py-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[12px] font-semibold text-foreground">
                      Northside Studio
                    </p>
                    <ChevronDown className="size-3 text-foreground-muted" />
                  </div>
                  <p className="font-mono text-[9px] text-foreground-muted">
                    6 forms · 148 submissions this month
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex size-6 items-center justify-center rounded-md border border-border bg-surface">
                    <Bell className="size-3 text-foreground-muted" />
                  </span>
                  <span className="flex h-6 items-center rounded-md bg-accent px-2 text-[9.5px] font-medium text-accent-foreground">
                    New form
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex min-w-0 flex-col gap-0.5 p-3">
                    <p className="truncate text-[8.5px] font-medium tracking-[0.08em] text-foreground-muted uppercase">
                      {stat.label}
                    </p>
                    <p className="text-lg leading-none font-semibold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    <p className="truncate text-[8.5px] text-foreground-muted">{stat.hint}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[8.5px] font-semibold tracking-[0.1em] text-foreground-muted uppercase">
                    Recent submissions
                  </p>
                  <span className="flex items-center gap-1 text-[8.5px] text-foreground-muted">
                    <span className="live-dot" />
                    Live
                  </span>
                </div>

                <ul className="flex flex-col gap-1">
                  {submissions.map((submission) => (
                    <li
                      key={submission.email}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                        submission.status === "New"
                          ? "border-accent/30 bg-accent-subtle/40"
                          : "border-border bg-surface"
                      }`}
                    >
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[9px] font-semibold text-foreground-secondary">
                        {submission.name.charAt(0)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[10.5px] font-medium text-foreground">
                          {submission.name}
                        </p>
                        <p className="truncate text-[9px] text-foreground-muted">
                          {submission.preview}
                        </p>
                      </div>
                      <Badge tone={submission.tone}>{submission.status}</Badge>
                      <span className="w-6 shrink-0 text-right text-[8.5px] text-foreground-muted">
                        {submission.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="floating-card animate-float-soft absolute top-24 -right-3 hidden w-52 rounded-xl p-3 md:block">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-success/10">
              <span className="live-dot" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-foreground">Submission received</p>
              <p className="truncate text-[9px] text-foreground-muted">
                Website contact form · now
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between rounded-md border border-border bg-surface px-2 py-1.5">
            <span className="font-mono text-[8.5px] text-foreground-muted">
              POST /api/f/frm_2c9a
            </span>
            <span className="font-mono text-[8.5px] text-success">201</span>
          </div>
        </div>

        <div className="floating-card absolute -bottom-10 -left-4 hidden w-60 rounded-xl p-3 lg:block">
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex size-4 items-center justify-center rounded-full bg-surface-muted text-[8px] font-semibold text-foreground-secondary">
                N
              </span>
              <span className="text-[9.5px] font-semibold text-foreground">Client portal</span>
            </div>
            <Badge tone="neutral">Read only</Badge>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {submissions.slice(0, 2).map((submission) => (
              <li key={submission.email} className="flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block truncate text-[9.5px] font-medium text-foreground">
                    {submission.name}
                  </span>
                  <span className="block truncate text-[8.5px] text-foreground-muted">
                    {submission.time} ago
                  </span>
                </span>
                <Badge tone={submission.tone}>{submission.status}</Badge>
              </li>
            ))}
          </ul>
          <p className="mt-2 border-t border-border pt-2 text-[8px] text-foreground-muted">
            Scoped to one form · no workspace access
          </p>
        </div>
      </div>

      <figcaption className="sr-only">
        A preview of the Formivo dashboard using sample data: the Northside Studio workspace shows
        recent submissions, lead statuses, a form endpoint receiving a new submission, and the
        read-only client portal a developer can share with one client.
      </figcaption>
    </figure>
  );
}
