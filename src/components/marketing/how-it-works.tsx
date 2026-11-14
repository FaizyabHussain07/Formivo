import { ArrowRight, ArrowUpRight, Check, Lock, UserPlus } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

const steps = [
  {
    number: "01",
    title: "Connect",
    body: "Add your Formivo endpoint to the website form you already have. One action attribute, no SDK.",
    visual: (
      <pre className="overflow-x-auto rounded-lg bg-[#0a1f26] p-3 font-mono text-[9.5px] leading-relaxed text-slate-300">
        <code>
          <span className="text-slate-500">{"<form"}</span>
          {"\n  "}
          <span className="text-teal-300">action</span>
          <span className="text-slate-500">=</span>
          <span className="text-emerald-300">&quot;/api/f/frm_2c9a&quot;</span>
          {"\n  "}
          <span className="text-teal-300">method</span>
          <span className="text-slate-500">=</span>
          <span className="text-emerald-300">&quot;POST&quot;</span>
          <span className="text-slate-500">{">"}</span>
        </code>
      </pre>
    ),
  },
  {
    number: "02",
    title: "Collect",
    body: "A visitor submits. Formivo validates the payload, applies rate limits, checks the plan and stores the lead.",
    visual: (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between rounded-lg border border-success/25 bg-success/5 px-2.5 py-1.5">
          <span className="font-mono text-[9.5px] text-success">201 Created</span>
          <span className="font-mono text-[9px] text-foreground-muted">148 ms</span>
        </div>
        <p className="font-mono text-[9px] text-foreground-muted">
          {`{ "success": true, "leadId": "sub_8f21" }`}
        </p>
      </div>
    ),
  },
  {
    number: "03",
    title: "Manage",
    body: "Search every submission, read the full payload, and move each lead through the status that matches reality.",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {[
          ["New", "accent"],
          ["Contacted", "warning"],
          ["Qualified", "accent"],
          ["Converted", "success"],
        ].map(([label, tone]) => (
          <Badge key={label} tone={tone as "accent" | "warning" | "success"}>
            {label}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    number: "04",
    title: "Share",
    body: "Invite a client to one form. They get a read-only view of their own enquiries, never your workspace.",
    visual: (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-2.5 py-1.5">
          <span className="flex items-center gap-1.5 text-[9.5px] text-foreground-secondary">
            <UserPlus className="size-3" aria-hidden="true" />
            Invite client
          </span>
          <Lock className="size-3 text-foreground-muted" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-1">
          <Check className="size-3 text-accent" aria-hidden="true" />
          <span className="text-[9px] text-foreground-muted">Scoped to one form</span>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="marketing-wash relative scroll-mt-20 overflow-hidden border-b border-border"
    >
      <div
        aria-hidden="true"
        className="marketing-grid pointer-events-none absolute inset-0 opacity-60"
      />
      <Container className="relative flex flex-col gap-12 py-20 sm:py-24">
        <SectionHeading
          eyebrow="How it works"
          title="From website form to organized lead. Without the backend hassle."
          description="Four steps, no new form builder. The endpoint is public by design; reading submissions always requires sign-in or a scoped client invitation."
          actions={
            <Link
              href="/docs/quickstart"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Read the quickstart
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />

        <ol className="relative grid gap-4 lg:grid-cols-4 lg:gap-3">
          <div
            aria-hidden="true"
            className="flow-rail absolute top-5 right-[10%] left-[10%] hidden h-px lg:block"
          />
          {steps.map((step, index) => (
            <li key={step.number} className="relative">
              <Reveal delay={index * 90}>
                <div className="flex gap-3 lg:flex-col">
                  <div className="flex flex-col items-center lg:w-full lg:flex-row lg:items-center lg:gap-2">
                    <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-[11px] font-semibold text-accent shadow-[0_1px_2px_rgb(11_31_42/0.06)]">
                      {step.number}
                    </span>
                    <span className="mt-2 h-full w-px bg-border lg:hidden" aria-hidden="true" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 rounded-xl border border-border bg-surface/90 p-4 backdrop-blur-sm">
                    <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-[12.5px] leading-6 text-foreground-secondary">{step.body}</p>
                    <div className="mt-auto pt-2">{step.visual}</div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-6 text-[12.5px] text-foreground-secondary">
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-accent" aria-hidden="true" />
            No API key to embed
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-accent" aria-hidden="true" />
            No server to deploy
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="size-3.5 text-accent" aria-hidden="true" />
            Reads always require authorization
          </span>
          <Link
            href="/features"
            className="ml-auto inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            See every capability
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
