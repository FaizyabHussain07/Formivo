import { ArrowUpRight, BadgeCheck, Check, ExternalLink, Quote as QuoteIcon } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import {
  COMMUNITY_DISCLAIMER,
  COMMUNITY_QUESTIONS,
  COMMUNITY_QUOTES,
  FOUNDER_RESPONSE,
  FOUNDER_STANCE,
  communitySources,
  type CommunityKind,
  type CommunityQuote,
} from "@/config/community";
import { founder } from "@/config/founder";
import { cn } from "@/lib/utils/cn";

const KIND_TONE: Record<CommunityKind, "accent" | "neutral" | "warning" | "success"> = {
  feedback: "accent",
  question: "warning",
  insight: "neutral",
  suggestion: "success",
};

function SourceLine({ url, label }: { url: string | null; label: string }) {
  if (!url) {
    return <span className="mt-1 block text-[10px] text-foreground-muted">{label}</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex items-center gap-1 text-[10px] text-foreground-muted underline-offset-2 hover:text-foreground hover:underline"
    >
      {label}
      <ExternalLink className="size-2.5" aria-hidden="true" />
    </a>
  );
}

function QuoteCard({ item, tone = "light" }: { item: CommunityQuote; tone?: "light" | "accent" }) {
  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col gap-4 rounded-xl border p-5",
        tone === "accent" ? "border-accent/25 bg-surface" : "border-border bg-surface-muted/35",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <QuoteIcon className="size-4 shrink-0 text-accent/60" aria-hidden="true" />
        <Badge tone={KIND_TONE[item.kind]}>{item.label}</Badge>
      </div>
      <blockquote className="text-[13px] leading-6 text-foreground">{item.quote}</blockquote>
      <footer className="mt-auto flex flex-col gap-0.5 border-t border-border pt-3">
        <span className="text-[12.5px] font-medium text-foreground">{item.name}</span>
        <span className="text-[11px] text-foreground-muted">{item.role}</span>
        <SourceLine url={item.sourceUrl} label={item.sourceLabel} />
      </footer>
    </article>
  );
}

export function CommunityFeedback() {
  // The portal quote is used once, in the differentiator block below.
  const feedback = COMMUNITY_QUOTES.filter(
    (quote) =>
      quote.kind !== "question" && quote.name !== "@uxbyissa" && quote.group !== "prelaunch",
  ).slice(0, 10);
  const portalQuote = COMMUNITY_QUOTES.find((quote) => quote.name === "@uxbyissa");
  const questions = COMMUNITY_QUESTIONS.slice(0, 6);

  return (
    <section id="community" className="border-b border-border bg-surface">
      <Container className="flex flex-col gap-12 py-20 sm:py-24">
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow="Community validation"
            title="Real conversations. Real workflow challenges."
            description="I asked developers how they handle form submissions across client projects, then launched Formivo and kept the thread open. These are the replies, questions and feature requests that came back, quoted as written."
            titleClassName="max-w-3xl"
          />
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={communitySources.launch}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-foreground-secondary transition-colors hover:border-border-strong hover:text-foreground"
            >
              LinkedIn launch discussion
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            <a
              href={communitySources.productHunt}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[11.5px] font-medium text-foreground-secondary transition-colors hover:border-border-strong hover:text-foreground"
            >
              Product Hunt discussion on X
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[11.5px] text-foreground-muted">
              Pre-launch LinkedIn discussion
            </span>
          </div>
        </div>

        <div className="grid gap-5 rounded-2xl border border-accent/25 bg-accent-subtle/25 p-5 sm:p-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10">
          <div className="flex flex-col items-start gap-3">
            <span className="eyebrow">The differentiator</span>
            <h3 className="max-w-lg text-2xl leading-[1.18] font-semibold tracking-[-0.022em] text-balance text-foreground sm:text-[1.7rem]">
              More than a form endpoint. A better way to share submissions with clients.
            </h3>
            <p className="max-w-lg text-[13.5px] leading-6 text-foreground-secondary">
              A client opens one link and sees the enquiries for the one form you shared. No
              forwarded inbox, no shared login, and no view into another client&apos;s leads.
            </p>
            <ul className="mt-1 flex flex-col gap-2">
              {[
                "Read-only access, scoped to one form per invitation",
                "Revoking access closes it on the next request",
                "The rest of your workspace stays private",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[12.5px] text-foreground-secondary"
                >
                  <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/docs/client-portal"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              See how the client portal works
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
            <p className="text-[11px] leading-5 text-foreground-muted">
              White-label domains are not available today. The portal runs on your Formivo link.
            </p>
          </div>

          {portalQuote ? (
            <div className="rounded-xl border border-border bg-surface p-5">
              <QuoteIcon className="size-4 text-accent/60" aria-hidden="true" />
              <blockquote className="mt-4 text-[15px] leading-7 font-medium text-foreground">
                {portalQuote.quote}
              </blockquote>
              <div className="mt-4 flex flex-col gap-0.5 border-t border-border pt-3">
                <span className="text-[12.5px] font-medium text-foreground">
                  {portalQuote.name}
                </span>
                <span className="text-[11px] text-foreground-muted">{portalQuote.role}</span>
                <SourceLine url={portalQuote.sourceUrl} label={portalQuote.sourceLabel} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                What developers said after the launch
              </h3>
              <p className="max-w-2xl text-[13px] leading-6 text-foreground-secondary">
                Different platforms, the same problem: submissions are easy, the workflow after them
                is not.
              </p>
            </div>
            <Badge tone="neutral">Quoted as written</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {feedback.map((item, index) => (
              <Reveal key={item.name + item.quote} delay={index * 35} className="h-full">
                <QuoteCard item={item} tone={item.group === "x" ? "accent" : "light"} />
              </Reveal>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-surface-muted/35 p-4 text-[12.5px] leading-6 text-foreground-secondary">
            <span className="font-medium text-foreground">Why teams switch: </span>
            the form you already built stays exactly where it is. Moving one action attribute is the
            whole migration, and the payoff is one submission list plus scoped access for each
            client.
          </div>
        </div>

        <div className="grid gap-6 rounded-2xl border border-border bg-surface-muted/35 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground">
                Questions and requests that shaped the build
              </h3>
              <Badge tone="neutral">Roadmap input</Badge>
            </div>
            <p className="text-[13px] leading-6 text-foreground-secondary">
              Each card says what is true today, including the requests that are still open.
            </p>

            <ul className="grid gap-2 sm:grid-cols-2">
              {questions.map((question) => (
                <li
                  key={question.name + question.topic}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[9px] tracking-[0.08em] text-foreground-muted uppercase">
                      {question.topic}
                    </span>
                    <Badge tone={KIND_TONE[question.kind]}>
                      {question.kind === "suggestion" ? "Feature suggestion" : "Product question"}
                    </Badge>
                  </div>
                  <p className="text-[11.5px] leading-5 text-foreground-secondary">
                    {question.detail}
                  </p>
                  <p className="text-[10.5px] leading-5 text-foreground-muted">{question.status}</p>
                  <p className="mt-auto text-[10px] text-foreground-muted">
                    {question.name} · {question.role}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-ink font-mono text-[11px] font-semibold text-brand-mint">
                {founder.initials}
              </span>
              <div className="flex flex-col">
                <span className="text-[12.5px] font-medium text-foreground">{founder.name}</span>
                <span className="text-[10.5px] text-foreground-muted">{founder.role}</span>
              </div>
            </div>

            <div className="rounded-xl border border-accent/20 bg-surface p-5">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-accent" aria-hidden="true" />
                <span className="text-[10px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">
                  Founder response
                </span>
              </div>
              <blockquote className="mt-3 text-[12.5px] leading-6 text-foreground">
                {FOUNDER_RESPONSE.quote}
              </blockquote>
              <p className="mt-3 border-t border-border pt-3 text-[10.5px] leading-5 text-foreground-muted">
                {FOUNDER_RESPONSE.verified}
              </p>
              <SourceLine url={FOUNDER_RESPONSE.sourceUrl} label="LinkedIn launch discussion" />
            </div>

            <p className="text-[12.5px] leading-6 text-foreground-secondary">{FOUNDER_STANCE}</p>

            <ul className="flex flex-col gap-1.5 border-t border-border pt-3">
              {[
                "Collecting submissions and storing every lead",
                "Lead statuses and a searchable workspace",
                "Read-only client access, scoped per form",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[11px] text-foreground-secondary"
                >
                  <Check className="mt-0.5 size-3 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent hover:underline"
            >
              Why Formivo exists
              <ArrowUpRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <p className="max-w-3xl text-[11px] leading-5 text-foreground-muted">
          {COMMUNITY_DISCLAIMER}
        </p>
      </Container>
    </section>
  );
}
