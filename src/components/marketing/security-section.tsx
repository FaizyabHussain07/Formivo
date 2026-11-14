import { Database, Gauge, KeyRound, Lock, Server, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";

const controls = [
  {
    icon: KeyRound,
    title: "A write-only public endpoint",
    body: "The endpoint accepts submissions. A GET returns 405. Stored data is never readable through the public URL.",
  },
  {
    icon: Lock,
    title: "Authorization on every read",
    body: "Ownership comes from the signed-in session, never from a form or submission id supplied in a query string.",
  },
  {
    icon: Database,
    title: "Row Level Security",
    body: "Postgres policies scope forms to their workspace and submissions to forms the caller is allowed to view.",
  },
  {
    icon: Users,
    title: "Client isolation, tested",
    body: "One form per invitation. Cross-account access is rejected and covered by the authorization test suite.",
  },
  {
    icon: Gauge,
    title: "Abuse controls",
    body: "Per-form and per-IP rate limits, honeypot fields, a 256 KB body cap and an immediate pause switch.",
  },
  {
    icon: Server,
    title: "Secrets stay server-side",
    body: "Database and provider keys are read through server-only modules and never serialized into the browser bundle.",
  },
];

function AccessNode({ step, title, detail }: { step: string; title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
      <p className="font-mono text-[8.5px] tracking-[0.12em] text-teal-300/80 uppercase">{step}</p>
      <p className="mt-1 text-[12px] font-medium text-white">{title}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-white/50">{detail}</p>
    </div>
  );
}

export function SecuritySection() {
  return (
    <section id="security" className="border-b border-border bg-surface-muted/40">
      <Container className="flex flex-col gap-10 py-20 sm:py-24">
        <SectionHeading
          eyebrow="Security and trust"
          title="Your clients' submissions deserve careful handling."
          description="A public form endpoint is only safe when the read side is genuinely closed. These are the controls that exist in Formivo today. No certifications, audits or guarantees that have not been earned."
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-8">
          <ul className="grid gap-2 sm:grid-cols-2">
            {controls.map((control, index) => {
              const Icon = control.icon;
              return (
                <li key={control.title}>
                  <Reveal delay={index * 40} className="h-full">
                    <div className="flex h-full gap-3 rounded-xl border border-border bg-surface p-4">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent">
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[13px] font-semibold text-foreground">
                          {control.title}
                        </h3>
                        <p className="text-[11.5px] leading-5 text-foreground-secondary">
                          {control.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <Reveal delay={100}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081b22] p-5 text-white sm:p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-16 size-56 rounded-full bg-[radial-gradient(circle,rgb(43_217_196/0.18),transparent_70%)]"
              />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.14em] text-white/45 uppercase">
                    Access boundary
                  </p>
                  <p className="mt-1 text-[13px] font-semibold">What can read a submission</p>
                </div>
                <span className="rounded-full border border-brand-mint/25 bg-brand-mint/10 px-2.5 py-0.5 text-[9px] font-medium text-brand-mint">
                  Enforced server-side
                </span>
              </div>

              <div className="relative mt-5 flex flex-col">
                <AccessNode
                  step="01 · Intake"
                  title="Public form endpoint"
                  detail="Write-only · no API key · validated and rate limited"
                />
                <div aria-hidden="true" className="mx-auto h-4 w-px bg-white/15" />
                <AccessNode
                  step="02 · Storage"
                  title="Postgres with Row Level Security"
                  detail="Workspace ownership set by the server, never the payload"
                />
                <div aria-hidden="true" className="mx-auto h-4 w-px bg-white/15" />
                <div className="grid grid-cols-2 gap-2">
                  <AccessNode
                    step="03a · Member"
                    title="Workspace member"
                    detail="Every form in their workspace"
                  />
                  <AccessNode
                    step="03b · Viewer"
                    title="Client viewer"
                    detail="One form · read-only · revocable"
                  />
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <p className="text-[9.5px] text-white/45">
                  No cross-client access. No shared logins.
                </p>
                <ShieldCheck className="size-4 text-teal-300/70" aria-hidden="true" />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-[12.5px] text-foreground-secondary">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-accent" aria-hidden="true" />
            No certifications or audit claims
          </span>
          <Link href="/security" className="font-medium text-accent hover:underline">
            Read the full security model
          </Link>
          <Link href="/privacy" className="font-medium text-accent hover:underline">
            Privacy policy
          </Link>
        </div>
      </Container>
    </section>
  );
}
