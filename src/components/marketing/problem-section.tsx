import {
  Clock,
  Code2,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  Layers,
  Lock,
  Mail,
  Search,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { COMMUNITY_DISCLAIMER, COMMUNITY_QUOTES, communitySources } from "@/config/community";
import { cn } from "@/lib/utils/cn";

type FlowStep = { title: string; detail: string; icon: LucideIcon };

const fragmented: FlowStep[] = [
  { title: "Website form", detail: "The visitor hits submit", icon: Code2 },
  { title: "Email inbox", detail: "One notification, easily missed", icon: Mail },
  { title: "Spreadsheets", detail: "Copied across by hand", icon: FileText },
  { title: "Separate dashboards", detail: "A different tool per client", icon: LayoutDashboard },
  { title: "Manual follow-ups", detail: "Tracked from memory", icon: Clock },
];

const unified: FlowStep[] = [
  { title: "Website form", detail: "Keep the form you already built", icon: Code2 },
  { title: "Formivo", detail: "One public endpoint per form", icon: Layers },
  { title: "Organized submissions", detail: "Stored, searchable, complete", icon: Inbox },
  { title: "Lead management", detail: "Statuses and one workspace view", icon: Search },
  { title: "Client access", detail: "A read-only view of their form", icon: Lock },
];

const themes = [
  {
    icon: Mail,
    title: "Email-only handling",
    body: "A notification is not a record. Once it is read or archived, the context is gone.",
  },
  {
    icon: Inbox,
    title: "Leads buried in inboxes",
    body: "Shared mailboxes, spam folders and personal accounts make ownership unclear.",
  },
  {
    icon: LayoutDashboard,
    title: "A different tool per project",
    body: "Every client site ends up with its own form service and its own login.",
  },
  {
    icon: Code2,
    title: "Rebuilding the backend",
    body: "Storage, validation, spam controls and email delivery repeated for every site.",
  },
  {
    icon: Search,
    title: "No central view",
    body: "There is no single place to see what came in across all client projects.",
  },
  {
    icon: Clock,
    title: "Follow-up left to memory",
    body: "Who replied, what happened next, and which leads are still open go unrecorded.",
  },
];

function FlowPanel({ variant }: { variant: "fragmented" | "unified" }) {
  const isUnified = variant === "unified";
  const steps = isUnified ? unified : fragmented;

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border p-5 sm:p-6",
        isUnified ? "border-accent/30 bg-accent-subtle/25" : "border-border bg-surface-muted/35",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] font-semibold text-foreground">
          {isUnified ? "With Formivo" : "Without a form backend"}
        </p>
        <Badge tone={isUnified ? "accent" : "neutral"}>
          {isUnified ? "One workflow" : "Fragmented"}
        </Badge>
      </div>

      <ol className="mt-5 flex flex-col">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title}>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                    isUnified
                      ? "border-accent/25 bg-surface text-accent"
                      : "border-border bg-surface text-foreground-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground">{step.title}</p>
                  <p className="text-[12px] text-foreground-secondary">{step.detail}</p>
                </div>
                <span className="font-mono text-[9px] text-foreground-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  aria-hidden="true"
                  className={cn(
                    "my-1 ml-[1.1rem] h-5 w-px",
                    isUnified ? "flow-rail-vertical bg-accent/50" : "bg-border-strong",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProblemSection() {
  const quotes = COMMUNITY_QUOTES.filter((quote) => quote.group === "prelaunch").slice(0, 4);
  const prelaunchSource = communitySources.prelaunch;

  return (
    <section id="problem" className="border-b border-border bg-surface">
      <Container className="flex flex-col gap-14 py-20 sm:py-24">
        <SectionHeading
          eyebrow="The problem"
          title="Building a form is easy. Managing what happens next is the hard part."
          description="A contact form is only the beginning. Once a website starts receiving enquiries, developers and agencies need a reliable way to store submissions, organize leads, and give clients access to the information they need."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal>
            <FlowPanel variant="fragmented" />
          </Reveal>
          <Reveal delay={100}>
            <FlowPanel variant="unified" />
          </Reveal>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, index) => {
            const Icon = theme.icon;
            return (
              <li key={theme.title}>
                <Reveal delay={index * 40} className="h-full">
                  <div className="flex h-full gap-3 rounded-xl border border-border bg-surface p-4">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-foreground-secondary">
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[13.5px] font-semibold text-foreground">{theme.title}</h3>
                      <p className="text-[12.5px] leading-relaxed text-foreground-secondary">
                        {theme.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>

        <div id="community-insights" className="flex flex-col gap-6 border-t border-border pt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Insights from the developer community</span>
              <h3 className="max-w-2xl text-2xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-[1.75rem]">
                Before Formivo launched, I asked developers what actually breaks.
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-foreground-secondary">
                The answers were consistent: collecting an enquiry is the easy part. Keeping it,
                organizing it, and getting it to the right client is where the workflow falls apart.
              </p>
            </div>
            {prelaunchSource ? (
              <Link
                href={prelaunchSource}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Read the discussion
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] text-foreground-muted">
                LinkedIn community discussion
              </span>
            )}
          </div>

          <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
            {quotes.map((quote, index) => (
              <Reveal key={quote.name} delay={index * 40} className="mb-3 break-inside-avoid">
                <article className="flex h-full flex-col gap-4 rounded-xl border border-border bg-surface-muted/35 p-5">
                  <span
                    aria-hidden="true"
                    className="font-serif text-2xl leading-none text-accent/60"
                  >
                    &ldquo;
                  </span>
                  <blockquote className="text-[13.5px] leading-6 text-foreground">
                    {quote.quote}
                  </blockquote>
                  <footer className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
                    <span className="text-[12.5px] font-medium text-foreground">{quote.name}</span>
                    <span className="text-[11px] text-foreground-muted">{quote.role}</span>
                    <span className="mt-1 text-[10px] text-foreground-muted">
                      LinkedIn Community Discussion
                    </span>
                  </footer>
                </article>
              </Reveal>
            ))}
          </div>

          <p className="max-w-3xl text-[11px] leading-5 text-foreground-muted">
            {COMMUNITY_DISCLAIMER}
          </p>
        </div>
      </Container>
    </section>
  );
}
