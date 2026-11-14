"use client";

import { Check } from "lucide-react";
import { useRef, useState, type KeyboardEvent } from "react";

import {
  AccessMockup,
  ClientPortalMockup,
  LeadDetailMockup,
  SubmissionsMockup,
} from "@/components/marketing/mockups";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";

const tabs = [
  {
    id: "submissions",
    label: "Submissions",
    description: "One searchable list across every client form",
    heading: "Every enquiry, in one place",
    body: "Submissions arrive with their form, source, full payload and timestamp. Search across contact details and message content, then filter by form or lead status.",
    points: [
      "Search across names, emails and messages",
      "Filter by form or status",
      "Pause a form instantly",
    ],
    visual: <SubmissionsMockup />,
  },
  {
    id: "detail",
    label: "Submission detail",
    description: "The full record, not a truncated email",
    heading: "Read the submission as it was sent",
    body: "Open a lead to see every submitted field, the page it came from, its submission id and any metadata you attached. It all stays in one record that survives after the notification email is gone.",
    points: ["Complete field values", "Source and metadata", "Timestamp and submission id"],
    visual: <LeadDetailMockup />,
  },
  {
    id: "client-portal",
    label: "Client portal",
    description: "A read-only view of one shared form",
    heading: "Clients see their enquiries, not your workspace",
    body: "An invited client opens a dedicated portal listing the submissions for the one form you shared. They can read and search their own leads; they cannot change statuses, settings or billing.",
    points: [
      "Scoped to one form per invitation",
      "Read-only by design",
      "Revocable on the next request",
    ],
    visual: <ClientPortalMockup />,
  },
  {
    id: "access",
    label: "Access control",
    description: "Per-form invitations you can revoke",
    heading: "Access is a permission, not a shared login",
    body: "Each client invitation creates a permission row tied to one form. Revoking it removes access immediately. A client never sees another client's forms or any part of your workspace.",
    points: [
      "Per-form client permissions",
      "Expiring invitation links",
      "Tested cross-account isolation",
    ],
    visual: <AccessMockup />,
  },
];

export function ProductShowcase() {
  const [active, setActive] = useState(tabs[0]!.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]!;

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = index === last ? 0 : index + 1;
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setActive(tabs[next]!.id);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className="border-b border-border bg-surface-muted/40">
      <Container className="flex flex-col gap-10 py-20 sm:py-24">
        <SectionHeading
          eyebrow="Product tour"
          title="Everything important, without unnecessary complexity."
          description="The workspace is deliberately small: create a form, read the submissions, and share the right ones. These previews use the real interface with sample data."
          titleClassName="max-w-2xl"
        />

        <div className="grid gap-4 lg:grid-cols-[19rem_1fr] lg:gap-6">
          <div
            role="tablist"
            aria-label="Product views"
            className="grid grid-cols-2 gap-2 lg:flex lg:flex-col"
          >
            {tabs.map((tab, index) => {
              const selected = tab.id === current.id;
              return (
                <button
                  key={tab.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`showcase-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`showcase-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(tab.id)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={cn(
                    "flex min-w-0 flex-col gap-1 rounded-xl border p-3 text-left transition-colors sm:p-4",
                    selected
                      ? "border-accent/35 bg-surface shadow-[0_10px_30px_-24px_rgb(11_31_42/0.4)]"
                      : "border-transparent bg-transparent hover:border-border hover:bg-surface/60",
                  )}
                >
                  <span
                    className={cn(
                      "text-[12.5px] leading-snug font-semibold sm:text-[13.5px]",
                      selected ? "text-foreground" : "text-foreground-secondary",
                    )}
                  >
                    {tab.label}
                  </span>
                  <span className="hidden text-[11.5px] leading-5 text-foreground-muted sm:block">
                    {tab.description}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="min-w-0">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                role="tabpanel"
                id={`showcase-panel-${tab.id}`}
                aria-labelledby={`showcase-tab-${tab.id}`}
                hidden={tab.id !== current.id}
                className="grid min-w-0 gap-5 rounded-2xl border border-border bg-surface p-3 sm:p-5 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-8 lg:p-7"
              >
                <div className="flex flex-col gap-3">
                  <Badge tone="accent">Product preview</Badge>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-balance text-foreground">
                    {tab.heading}
                  </h3>
                  <p className="text-[13.5px] leading-6 text-foreground-secondary">{tab.body}</p>
                  <ul className="mt-1 flex flex-col gap-2">
                    {tab.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-[12.5px] text-foreground-secondary"
                      >
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="min-w-0">{tab.visual}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-foreground-muted">
          Product previews use sample data. Formivo does not display a fabricated customer dashboard
          as a screenshot.
        </p>
      </Container>
    </section>
  );
}
