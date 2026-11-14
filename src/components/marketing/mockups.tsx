import {
  Check,
  ChevronDown,
  Download,
  Filter,
  Lock,
  Mail,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";

import { Badge, type BadgeTone } from "@/components/ui/badge";

/**
 * Faithful, hand-built representations of the real Formivo screens. They use the
 * same labels, statuses and layout as the application, and are always presented as
 * product previews with sample data, never as a customer's live dashboard.
 */

type Status = "New" | "Read" | "Contacted" | "Qualified" | "Converted";

const statusTone: Record<Status, BadgeTone> = {
  New: "accent",
  Read: "neutral",
  Contacted: "warning",
  Qualified: "accent",
  Converted: "success",
};

const leads: {
  name: string;
  email: string;
  form: string;
  preview: string;
  status: Status;
  time: string;
}[] = [
  {
    name: "Jordan Alvarez",
    email: "jordan@northside.co",
    form: "Website contact",
    preview: "Need a quote for a 6-page site.",
    status: "New",
    time: "2m ago",
  },
  {
    name: "Priya Raman",
    email: "priya@ramanlegal.com",
    form: "Project enquiry",
    preview: "Can we book a call this week?",
    status: "Contacted",
    time: "1h ago",
  },
  {
    name: "Tomas Lind",
    email: "tomas@lindstudio.se",
    form: "Website contact",
    preview: "Budget approved, sending the brief.",
    status: "Qualified",
    time: "3h ago",
  },
  {
    name: "Amara Okafor",
    email: "amara@okafor.studio",
    form: "Project enquiry",
    preview: "Do you handle ongoing maintenance?",
    status: "Read",
    time: "Yesterday",
  },
  {
    name: "Ben Whitfield",
    email: "ben@whitfield.co",
    form: "Website contact",
    preview: "Signed the proposal. Thanks.",
    status: "Converted",
    time: "2d ago",
  },
];

export function BrowserChrome({ label, badge }: { label: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/70 px-3.5 py-2.5">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="size-2 rounded-full bg-border-strong" />
      </div>
      <p className="truncate font-mono text-[10.5px] text-foreground-muted">{label}</p>
      {badge ? <Badge tone="neutral">{badge}</Badge> : <span className="w-8" aria-hidden="true" />}
    </div>
  );
}

export function SubmissionsMockup({ compact = false }: { compact?: boolean }) {
  const rows = compact ? leads.slice(0, 3) : leads;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <BrowserChrome label="formivo / submissions" badge="Sample data" />
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3.5 py-3">
        <span className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground-muted">
          <Search className="size-3.5" aria-hidden="true" />
          Search name, email or message
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-foreground-secondary">
          <Filter className="size-3.5" aria-hidden="true" />
          All forms
          <ChevronDown className="size-3" aria-hidden="true" />
        </span>
        <span className="hidden items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-foreground-muted sm:flex">
          <Download className="size-3.5" aria-hidden="true" />
          Export
        </span>
      </div>

      <div className="grid grid-cols-[1.6fr_1fr_auto] gap-3 border-b border-border bg-surface-muted/50 px-3.5 py-2 text-[9.5px] font-semibold tracking-[0.1em] text-foreground-muted uppercase sm:grid-cols-[1.5fr_1fr_auto_auto]">
        <span>Contact</span>
        <span className="hidden sm:block">Preview</span>
        <span>Status</span>
        <span className="text-right">Received</span>
      </div>

      <ul className="divide-y divide-border">
        {rows.map((lead) => (
          <li
            key={lead.email}
            className="grid grid-cols-[1.6fr_1fr_auto] items-center gap-3 px-3.5 py-3 sm:grid-cols-[1.5fr_1fr_auto_auto]"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[10px] font-semibold text-foreground-secondary"
              >
                {lead.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium text-foreground">
                  {lead.name}
                </span>
                <span className="block truncate text-[10.5px] text-foreground-muted">
                  {lead.email}
                </span>
              </span>
            </div>
            <span className="hidden truncate text-[11px] text-foreground-secondary sm:block">
              {lead.preview}
            </span>
            <Badge tone={statusTone[lead.status]}>{lead.status}</Badge>
            <span className="text-right text-[10.5px] whitespace-nowrap text-foreground-muted">
              {lead.time}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-border bg-surface-muted/40 px-3.5 py-2.5 text-[10.5px] text-foreground-muted">
        <span>Showing {rows.length} of 148 submissions</span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="live-dot" aria-hidden="true" />
          Live intake
        </span>
      </div>
    </div>
  );
}

export function LeadDetailMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <BrowserChrome label="formivo / submissions / lead" badge="Sample data" />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-foreground">Submission details</p>
            <Badge tone="accent">New</Badge>
          </div>
          <p className="text-[10.5px] text-foreground-muted">
            Received 11 Nov 2026, 09:12 · Website contact form
          </p>
        </div>
        <div className="flex items-end gap-2">
          <span className="flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-[10.5px] text-foreground-secondary">
            New
            <ChevronDown className="size-3" aria-hidden="true" />
          </span>
          <span className="flex h-7 items-center rounded-md bg-accent px-2.5 text-[10.5px] font-medium text-accent-foreground">
            Save
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-[1.55fr_1fr]">
        <div className="rounded-lg border border-border">
          <p className="border-b border-border px-3 py-2 text-[10.5px] font-semibold text-foreground">
            Submitted data
          </p>
          <dl className="divide-y divide-border text-[11px]">
            {[
              ["Name", "Jordan Alvarez"],
              ["Email", "jordan@northside.co"],
              ["Company", "Northside Studio"],
              ["Budget", "$4,000 to $8,000"],
              [
                "Message",
                "We need a six-page site with a simple CMS. Can you send a quote and a timeline?",
              ],
            ].map(([key, value]) => (
              <div key={key} className="grid grid-cols-[4.5rem_1fr] gap-2 px-3 py-2">
                <dt className="text-foreground-muted">{key}</dt>
                <dd className="text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10.5px] font-semibold text-foreground">Context</p>
            <dl className="mt-2 flex flex-col gap-2 text-[10.5px]">
              <div>
                <dt className="text-foreground-muted">Source</dt>
                <dd className="text-foreground-secondary">northsidestudio.com/contact</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">Submission ID</dt>
                <dd className="font-mono text-[9.5px] break-all text-foreground-secondary">
                  sub_8f21c4a7
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10.5px] font-semibold text-foreground">Metadata</p>
            <p className="mt-2 font-mono text-[9.5px] leading-relaxed text-foreground-muted">
              {`{ "page": "/contact", "campaign": "brand-search" }`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientPortalMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <BrowserChrome label="formivo / client portal" badge="Read only" />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-semibold text-foreground">Northside Studio</p>
          <p className="text-[10.5px] text-foreground-muted">Shared by your developer · 1 form</p>
        </div>
        <Badge tone="neutral">
          <Lock className="size-3" aria-hidden="true" />
          Client view
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground-muted">
          <Search className="size-3.5" aria-hidden="true" />
          Search enquiries
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-foreground-secondary">
          <SlidersHorizontal className="size-3.5" aria-hidden="true" />
          Status
        </span>
      </div>

      <ul className="divide-y divide-border">
        {leads.slice(0, 3).map((lead) => (
          <li key={lead.email} className="flex items-start gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[10px] font-semibold text-foreground-secondary"
            >
              {lead.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium text-foreground">{lead.name}</p>
              <p className="truncate text-[10.5px] text-foreground-secondary">{lead.preview}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge tone={statusTone[lead.status]}>{lead.status}</Badge>
              <span className="text-[9.5px] text-foreground-muted">{lead.time}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 border-t border-border bg-surface-muted/40 px-4 py-2.5 text-[9.5px] text-foreground-muted">
        <span>Showing 3 of 42 enquiries</span>
        <span className="flex items-center gap-1">
          <Check className="size-3 text-accent" aria-hidden="true" />
          Access scoped to this form
        </span>
      </div>
    </div>
  );
}

const viewers = [
  { name: "Jordan at Northside", email: "client@northsidestudio.com" },
  { name: "Priya Raman", email: "priya@ramanlegal.com" },
] as const;

export function AccessMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <BrowserChrome label="formivo / client access" badge="Sample data" />
      <div className="border-b border-border px-4 py-3">
        <p className="text-[13px] font-semibold text-foreground">Client access</p>
        <p className="text-[10.5px] text-foreground-muted">
          Website contact form · Northside Studio
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] text-foreground-muted">
          <Mail className="size-3.5" aria-hidden="true" />
          client@northsidestudio.com
        </span>
        <span className="flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[10.5px] font-medium text-accent-foreground">
          <UserPlus className="size-3.5" aria-hidden="true" />
          Invite
        </span>
      </div>

      <ul className="divide-y divide-border">
        {viewers.map((viewer) => (
          <li key={viewer.email} className="flex items-center gap-3 px-4 py-3">
            <span
              aria-hidden="true"
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[10px] font-semibold text-foreground-secondary"
            >
              {viewer.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium text-foreground">{viewer.name}</p>
              <p className="truncate text-[10px] text-foreground-muted">{viewer.email}</p>
            </div>
            <Badge tone="neutral">
              <Lock className="size-2.5" aria-hidden="true" />
              Read only
            </Badge>
            <span className="hidden text-[10px] font-medium text-foreground-muted sm:inline">
              Revoke
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 border-t border-border bg-surface-muted/40 px-4 py-2.5 text-[9.5px] text-foreground-muted">
        <Users className="size-3" aria-hidden="true" />
        Each invitation is scoped to one form. Revoking closes access on the next request.
      </div>
    </div>
  );
}

export function EndpointCard({
  endpoint = "https://formivo.faizyab.me/api/f/frm_2c9a41be7f",
}: {
  endpoint?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-2.5">
        <p className="font-mono text-[10.5px] text-foreground-muted">POST · form endpoint</p>
        <Badge tone="success">No API key</Badge>
      </div>
      <div className="flex flex-col gap-3 p-4">
        <code className="block truncate rounded-lg border border-border bg-surface-muted px-3 py-2 font-mono text-[10.5px] text-foreground-secondary">
          {endpoint}
        </code>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="font-mono text-[10px] text-foreground-muted">201 Created</span>
          <span className="font-mono text-[10px] text-accent">{`{ "success": true }`}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["256 KB body limit", "Rate limited", "Honeypot ready"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-[9.5px] text-foreground-muted"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormBuilderMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <BrowserChrome label="northsidestudio.com / contact" badge="Your site" />
      <div className="grid gap-4 p-4 sm:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-2.5">
          <div className="h-2 w-20 rounded-full bg-border" />
          <div className="h-8 rounded-lg border border-border bg-surface-muted/60" />
          <div className="h-2 w-16 rounded-full bg-border" />
          <div className="h-8 rounded-lg border border-border bg-surface-muted/60" />
          <div className="h-2 w-24 rounded-full bg-border" />
          <div className="h-16 rounded-lg border border-border bg-surface-muted/60" />
          <div className="mt-1 flex h-8 w-24 items-center justify-center rounded-lg bg-accent text-[10.5px] font-medium text-accent-foreground">
            Send message
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-muted/40 p-3">
          <span className="font-mono text-[9px] tracking-wide text-foreground-muted uppercase">
            Supabase · Resend · Server
          </span>
          <div className="flex flex-col gap-1.5 opacity-60">
            {["Database schema", "Email delivery", "Spam rules", "Retries"].map((item) => (
              <span
                key={item}
                className="flex items-center justify-between rounded-md border border-border bg-surface px-2 py-1.5 text-[10px] text-foreground-secondary"
              >
                {item}
                <span className="text-foreground-muted">skip</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormivoMark() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold tracking-tight text-foreground">
      <span className="flex size-4 items-center justify-center rounded-[4px] bg-brand-mint text-[8px] font-bold text-brand-ink">
        F
      </span>
      Formivo
    </span>
  );
}
