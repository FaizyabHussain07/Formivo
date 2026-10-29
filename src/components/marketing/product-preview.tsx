import { Inbox, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Forms", value: "3", hint: "+1 this month" },
  { label: "Total leads", value: "233", hint: "All time" },
  { label: "New this week", value: "17", hint: "Needs review" },
];

const forms = [
  {
    name: "Website Contact Form",
    endpoint: "/api/f/frm_2c9a41be7f",
    count: 128,
    tone: "success" as const,
  },
  {
    name: "Project Enquiry",
    endpoint: "/api/f/frm_77d3e0a115",
    count: 64,
    tone: "success" as const,
  },
  {
    name: "Newsletter Signup",
    endpoint: "/api/f/frm_9b1f5c82da",
    count: 41,
    tone: "neutral" as const,
  },
];

const submissions = [
  {
    initials: "J",
    name: "Jordan Alvarez",
    email: "jordan@northside.co",
    status: "New",
    tone: "accent" as const,
    time: "2m ago",
  },
  {
    initials: "P",
    name: "Priya Raman",
    email: "priya@raman.dev",
    status: "Contacted",
    tone: "neutral" as const,
    time: "1h ago",
  },
  {
    initials: "T",
    name: "Tomas Lind",
    email: "tomas@lindstudio.se",
    status: "Qualified",
    tone: "warning" as const,
    time: "3h ago",
  },
];

/** Static product preview used in the marketing hero. Not interactive. */
export function ProductPreview() {
  return (
    <div className="surface-ring overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-border-strong" />
          <span className="size-2 rounded-full bg-border-strong" />
          <span className="size-2 rounded-full bg-border-strong" />
        </div>
        <p className="font-mono text-[11px] text-foreground-muted">formivo / overview</p>
        <Badge tone="success">Demo data</Badge>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 p-4">
            <p className="text-[11px] font-medium tracking-wide text-foreground-muted uppercase">
              {stat.label}
            </p>
            <p className="text-xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="text-[11px] text-foreground-muted">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-foreground-secondary uppercase">
            <Mail className="size-3.5 text-foreground-muted" aria-hidden="true" />
            Forms
          </p>
          <p className="text-[11px] text-foreground-muted">Endpoint</p>
        </div>
        <ul className="flex flex-col gap-2">
          {forms.map((form) => (
            <li
              key={form.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-foreground">{form.name}</p>
                <p className="truncate font-mono text-[10.5px] text-foreground-muted">
                  {form.endpoint}
                </p>
              </div>
              <Badge tone={form.tone}>{form.count}</Badge>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-foreground-secondary uppercase">
          <Inbox className="size-3.5 text-foreground-muted" aria-hidden="true" />
          Recent submissions
        </p>
        <ul className="flex flex-col gap-3">
          {submissions.map((submission) => (
            <li key={submission.email} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-semibold text-foreground-secondary"
              >
                {submission.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">
                  {submission.name}
                </p>
                <p className="truncate text-[11px] text-foreground-muted">{submission.email}</p>
              </div>
              <Badge tone={submission.tone}>{submission.status}</Badge>
              <span className="w-14 shrink-0 text-right text-[11px] text-foreground-muted">
                {submission.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
