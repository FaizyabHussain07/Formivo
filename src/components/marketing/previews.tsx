import { CheckCircle2, Clock, Download, Filter, Lock, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * Marketing previews. These are static illustrations of real screens, not live
 * data, and they are labelled as such. Keeping them in one module makes the
 * landing page sections consistent and cheap to render.
 */

const leads = [
  { name: "Jordan Alvarez", company: "Northside Studio", message: "Need a quote for a 6-page site.", status: "New", tone: "accent" as const, when: "9:12" },
  { name: "Priya Raman", company: "Raman Legal", message: "Can we book a call this week?", status: "Contacted", tone: "neutral" as const, when: "8:40" },
  { name: "Tomas Lind", company: "Lind & Co", message: "Budget approved, sending brief.", status: "Qualified", tone: "warning" as const, when: "Yesterday" },
];

export function ClientPortalPreview() {
  return (
    <div className="surface-ring overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Badge tone="neutral">
            <Lock className="size-3" aria-hidden="true" />
            Client view
          </Badge>
          <p className="font-mono text-[11px] text-foreground-muted">Website Contact Form</p>
        </div>
        <Badge tone="success">Read only</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <span className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-foreground-muted">
          <Search className="size-3.5" aria-hidden="true" />
          Search name, email or message
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] text-foreground-secondary">
          <Filter className="size-3.5" aria-hidden="true" />
          Status
        </span>
        <span className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[12px] text-foreground-muted">
          <Download className="size-3.5" aria-hidden="true" />
          Export
        </span>
      </div>

      <ul className="divide-y divide-border">
        {leads.map((lead) => (
          <li key={lead.name} className="flex items-start gap-3 px-4 py-3.5">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[11px] font-semibold text-foreground-secondary"
            >
              {lead.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">
                {lead.name}
                <span className="ml-2 font-normal text-foreground-muted">{lead.company}</span>
              </p>
              <p className="truncate text-[12px] text-foreground-secondary">{lead.message}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge tone={lead.tone}>{lead.status}</Badge>
              <span className="flex items-center gap-1 text-[10.5px] text-foreground-muted">
                <Clock className="size-3" aria-hidden="true" />
                {lead.when}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-muted/40 px-4 py-2.5 text-[11px] text-foreground-muted">
        <span>Showing 3 of 128 submissions</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="size-3 text-accent" aria-hidden="true" />
          Client permissions enforced server-side
        </span>
      </div>
    </div>
  );
}

export function EndpointResponsePreview() {
  return (
    <div className="surface-ring overflow-hidden rounded-xl border border-border bg-[#0a1a17] text-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
        <p className="font-mono text-[11px] text-slate-400">terminal</p>
        <Badge tone="success">201 Created</Badge>
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12px] leading-relaxed">
        <code>
          <span className="text-slate-500">$</span> curl -X POST &quot;https://formivo.faizyab.me/api/f/
          frm_2c9a41be7f&quot; \{"\n"}
          {"  "}-H &quot;Content-Type: application/json&quot; \{"\n"}
          {"  "}-d &apos;{`{"name":"Ada Lovelace","email":"ada@example.com"}`}&apos;{"\n\n"}
          <span className="text-teal-300">HTTP/2 201</span>
          {"\n"}
          {`{ "success": true, "data": { "submissionId": "sub_8f21c4", "status": "new" } }`}
        </code>
      </pre>
    </div>
  );
}
