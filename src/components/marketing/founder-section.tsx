import { ArrowUpRight, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

import { FounderVideo } from "@/components/marketing/founder-video";
import { Reveal } from "@/components/marketing/reveal";
import { Container } from "@/components/ui/container";
import { founder } from "@/config/founder";

export function FounderSection() {
  return (
    <section id="founder" className="border-b border-border bg-surface-muted/40">
      <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-16">
        <Reveal>
          <div className="flex flex-col items-start">
            <span className="eyebrow">From the founder</span>
            <h2 className="mt-5 max-w-xl text-3xl leading-[1.14] font-semibold tracking-[-0.022em] text-balance text-foreground sm:text-4xl">
              Meet Formivo. Built by a developer who understands the workflow.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-foreground-secondary">
              Formivo started with a practical question: what happens after someone submits a
              website contact form?
            </p>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-foreground-secondary">
              I built Formivo to make that process simpler for developers and agencies managing
              client websites. It is not a replacement for the form you already designed. It handles
              what comes after it.
            </p>

            <ul className="mt-6 flex flex-col gap-2">
              {[
                "Independent product, built in the open",
                "Focused on submissions, leads and client access",
                "No claim of being a CRM or an enterprise sales suite",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-foreground-secondary"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-brand-ink font-mono text-[11px] font-semibold text-brand-mint">
                  {founder.initials}
                </span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-foreground">{founder.name}</span>
                  <span className="text-[11px] text-foreground-muted">{founder.role}</span>
                </div>
              </div>
              <a
                href={founder.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-foreground-secondary underline-offset-2 hover:text-foreground hover:underline"
              >
                faizyab.me
                <ArrowUpRight className="size-3" aria-hidden="true" />
              </a>
              {founder.launchPostUrl ? (
                <a
                  href={founder.launchPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-accent hover:underline"
                >
                  Launch post
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="flex min-w-0 flex-col gap-4">
            <FounderVideo />

            <p className="text-[11px] leading-5 text-foreground-muted">
              Formivo is built independently by{" "}
              <Link href="/about" className="font-medium text-foreground-secondary hover:underline">
                {founder.name}
              </Link>
              . The walkthrough is the public launch video, also shared with the{" "}
              {founder.launchPostUrl ? (
                <a
                  href={founder.launchPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground-secondary underline-offset-2 hover:text-foreground hover:underline"
                >
                  LinkedIn launch post
                </a>
              ) : (
                "LinkedIn launch post"
              )}
              .
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
