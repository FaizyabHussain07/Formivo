import { ArrowRight, Check, Code2, Inbox, Users } from "lucide-react";
import Link from "next/link";

import {
  ClientPortalMockup,
  EndpointCard,
  SubmissionsMockup,
} from "@/components/marketing/mockups";
import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

const endpoint = `${siteConfig.productionUrl}/api/f/YOUR_FORM_ID`;

const htmlSnippet = `<form action="${endpoint}" method="POST">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message"></textarea>

  <button type="submit">Send</button>
</form>`;

function Capability({
  index,
  label,
  icon: Icon,
  title,
  body,
  points,
  href,
  linkLabel,
  visual,
  reverse = false,
}: {
  index: string;
  label: string;
  icon: typeof Code2;
  title: string;
  body: string;
  points: string[];
  href: string;
  linkLabel: string;
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <Reveal>
      <article className="grid min-w-0 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={cn("min-w-0", reverse && "lg:order-2")}>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg border border-accent/20 bg-accent-subtle text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] text-foreground-muted uppercase">
              {index} · {label}
            </span>
          </div>
          <h3 className="mt-4 max-w-lg text-2xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-[1.75rem]">
            {title}
          </h3>
          <p className="mt-3 max-w-lg text-[14.5px] leading-7 text-foreground-secondary">{body}</p>
          <ul className="mt-5 flex flex-col gap-2.5">
            {points.map((point) => (
              <li key={point} className="flex gap-2.5 text-[13.5px] text-foreground-secondary">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            {linkLabel}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className={cn("min-w-0", reverse && "lg:order-1")}>{visual}</div>
      </article>
    </Reveal>
  );
}

export function SolutionSection() {
  return (
    <section id="product" className="scroll-mt-20 border-b border-border bg-surface">
      <Container className="flex flex-col gap-16 py-20 sm:py-24">
        <SectionHeading
          eyebrow="The solution"
          title="One place for every website submission."
          description="Formivo brings form submissions and client lead management into one simple workflow, helping developers spend less time building submission infrastructure and more time delivering great websites."
        />

        <div className="flex flex-col gap-16 sm:gap-20">
          <Capability
            index="01"
            label="Connect"
            icon={Code2}
            title="Connect the forms you already built."
            body="Keep your markup, styling and validation. Create a form in Formivo, copy its public endpoint, and point the existing form at it. No SDK, no secret in the browser, no rebuild."
            points={[
              "Accepts form-encoded, multipart and JSON submissions.",
              "No API key to embed. A key in client markup is not a secret.",
              "Optional _redirect sends visitors back to your own thank-you page.",
            ]}
            href="/guides/html"
            linkLabel="Explore form integration"
            visual={
              <div className="flex min-w-0 flex-col gap-3">
                <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-[#0a1f26]">
                  <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2">
                    <span className="font-mono text-[10px] text-slate-400">contact.html</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[9px] text-slate-300">
                      No rebuild
                    </span>
                  </div>
                  <pre className="overflow-x-auto p-4 font-mono text-[10px] leading-relaxed text-slate-300 sm:text-[11px]">
                    <code>{htmlSnippet}</code>
                  </pre>
                </div>
                <EndpointCard />
              </div>
            }
          />

          <Capability
            index="02"
            label="Manage"
            icon={Inbox}
            title="Manage every submission in one workspace."
            body="Submissions land as complete records: the full payload, the source, a timestamp and a lead status. Search across contact fields, filter by form or status, and keep follow-up visible instead of hoping it stays in an inbox."
            points={[
              "Lead statuses from New through Contacted, Qualified and Converted.",
              "Search, form filters and full submission detail.",
              "CSV export on Light, Pro and Agency, enforced on the server.",
            ]}
            href="/docs/submissions"
            linkLabel="Explore lead management"
            visual={<SubmissionsMockup />}
            reverse
          />

          <Capability
            index="03"
            label="Share"
            icon={Users}
            title="Give clients their own access."
            body="Invite a client to exactly one form. Their account opens a read-only portal for that form. No workspace, no billing, no settings, and no visibility into another client's submissions."
            points={[
              "One form per invitation, with an expiring single-use link.",
              "Read-only by design: clients cannot edit submissions or settings.",
              "Revoke access at any time; it applies on the very next request.",
            ]}
            href="/docs/client-portal"
            linkLabel="Explore the client portal"
            visual={<ClientPortalMockup />}
          />
        </div>
      </Container>
    </section>
  );
}
