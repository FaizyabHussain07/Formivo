import { ArrowRight, Briefcase, Building2, Check, Users } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";

function FreelancerVisual() {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-foreground">Website contact form</span>
        <Badge tone="success">Active</Badge>
      </div>
      <code className="mt-2 block truncate rounded-md border border-border bg-surface-muted px-2 py-1.5 font-mono text-[9px] text-foreground-secondary">
        /api/f/frm_2c9a41be7f
      </code>
      <div className="mt-2 flex items-center justify-between text-[9px] text-foreground-muted">
        <span>128 submissions</span>
        <span className="font-mono text-success">201 Created</span>
      </div>
    </div>
  );
}

function AgencyVisual() {
  const forms = [
    ["Northside Studio", "Website contact", 128],
    ["Raman Legal", "Project enquiry", 64],
    ["Lind & Co", "Contact form", 41],
  ] as const;

  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-foreground">Client forms</span>
        <span className="font-mono text-[8.5px] text-foreground-muted">6 active</span>
      </div>
      <ul className="flex flex-col gap-1">
        {forms.map(([client, form, count]) => (
          <li
            key={client}
            className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-1.5"
          >
            <span className="min-w-0">
              <span className="block truncate text-[10px] font-medium text-foreground">
                {client}
              </span>
              <span className="block truncate text-[8.5px] text-foreground-muted">{form}</span>
            </span>
            <span className="font-mono text-[9px] text-foreground-muted">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamVisual() {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="grid grid-cols-3 gap-1.5">
        {[
          ["New", "12"],
          ["This month", "148"],
          ["Converted", "31"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-border p-2">
            <p className="text-[8px] tracking-wide text-foreground-muted uppercase">{label}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between rounded-md bg-surface-muted/60 px-2 py-1.5">
        <span className="text-[9px] text-foreground-secondary">Jordan Alvarez</span>
        <span className="rounded-full bg-accent-subtle px-1.5 py-0.5 text-[8px] font-medium text-accent">
          New
        </span>
      </div>
    </div>
  );
}

const cases = [
  {
    icon: Briefcase,
    title: "Freelance developers",
    body: "Manage website submissions without rebuilding a backend for every project.",
    benefit: "One endpoint replaces storage, validation and delivery plumbing.",
    href: "/guides/html",
    linkLabel: "Connect an HTML form",
    visual: <FreelancerVisual />,
  },
  {
    icon: Building2,
    title: "Web development agencies",
    body: "Keep client submissions organized across multiple website projects.",
    benefit: "Read-only client access, scoped per form and revocable at any time.",
    href: "/docs/client-portal",
    linkLabel: "See how client access works",
    visual: <AgencyVisual />,
  },
  {
    icon: Users,
    title: "Independent developers and small teams",
    body: "Connect existing forms to a centralized submission management workflow.",
    benefit: "One workspace for leads, statuses and search. Free to start.",
    href: "/pricing",
    linkLabel: "Explore the free plan",
    visual: <TeamVisual />,
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="scroll-mt-20 border-b border-border bg-surface">
      <Container className="flex flex-col gap-10 py-20 sm:py-24">
        <SectionHeading
          eyebrow="Who it is for"
          title="Built for the people behind client websites."
          description="Formivo is infrastructure for the work after the form: collecting submissions, keeping leads organized, and giving each client the right view. It is not a CRM or an enterprise sales platform."
        />

        <ul className="grid gap-4 md:grid-cols-3">
          {cases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <li key={useCase.title}>
                <Reveal delay={index * 80} className="h-full">
                  <article className="card-lift flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
                    <div className="border-b border-border bg-surface-muted/40 p-4">
                      {useCase.visual}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <span className="flex size-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-subtle text-accent">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <h3 className="text-[16px] font-semibold tracking-tight text-foreground">
                        {useCase.title}
                      </h3>
                      <p className="text-[13px] leading-6 text-foreground-secondary">
                        {useCase.body}
                      </p>
                      <p className="mt-1 flex gap-2 text-[12px] leading-5 text-foreground-secondary">
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-accent"
                          aria-hidden="true"
                        />
                        {useCase.benefit}
                      </p>
                      <Link
                        href={useCase.href}
                        className="mt-auto inline-flex items-center gap-1 pt-2 text-[13px] font-medium text-accent transition-colors hover:text-accent-hover"
                      >
                        {useCase.linkLabel}
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
