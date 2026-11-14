import { ArrowRight, Check, Share2, Inbox, Code2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { JsonLd } from "@/components/marketing/structured-data";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { canonicalUrl, socialImage } from "@/lib/seo";

const title = "How Formivo Works: Connect a Form, Collect Leads, Share Access";
const description =
  "Three steps: connect an existing website form to one endpoint, collect and organize submissions in your workspace, and invite a client to a read-only view of their own form.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title,
    description,
    url: canonicalUrl("/how-it-works"),
    images: [
      socialImage({
        title: "How Formivo works",
        subtitle: "Connect a form. Collect submissions. Share access with one client.",
      }),
    ],
  },
  twitter: { card: "summary_large_image", title, description },
};

const steps = [
  {
    icon: Code2,
    title: "Connect your form",
    body: "Create a form in your workspace and copy its endpoint. Point the website form you already have at it: one action attribute, same field names. Requires no SDK, no key and no deploy.",
    detail: [
      "Works with HTML, React, Next.js, Vue, PHP and any HTTP client",
      "JSON, urlencoded and multipart bodies accepted",
      "Optional redirect and honeypot reserved fields",
    ],
    link: { href: "/integrations", label: "See integration guides" },
  },
  {
    icon: Inbox,
    title: "Collect and manage submissions",
    body: "Every accepted submission becomes a record with its fields, source and time. Search across the workspace, filter by form, and move a lead through New, Read, Contacted, Qualified, Converted or Archived.",
    detail: [
      "Validation, rate limits and your plan quota are checked before storage",
      "Duplicate retries with the same idempotency key do not create a second lead",
      "CSV export on Light, Pro and Agency",
    ],
    link: { href: "/docs/submissions", label: "Submission management" },
  },
  {
    icon: Share2,
    title: "Share access with your client",
    body: "Invite a client to one form. They get a read-only account scoped to that form, and never see another project, your settings or your billing. Revoke the permission and access ends on the next request.",
    detail: [
      "Invitations are single-use and expire",
      "Access is checked on every read, not cached",
      "Row-level security enforces the same boundary in the database",
    ],
    link: { href: "/client-portal", label: "What clients see" },
  },
];

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to collect website form submissions and share them with a client",
          totalTime: "PT10M",
          step: steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step.title,
            text: step.body,
            url: canonicalUrl(`/how-it-works#step-${index + 1}`),
          })),
        }}
      />
      <Breadcrumbs items={[{ href: "/how-it-works", label: "How it works" }]} />

      <Container className="flex flex-col gap-12 py-12 lg:py-16">
        <PageHeader
          eyebrow="How it works"
          title="Your form already exists. Connect it, then keep what arrives."
          description="Formivo does not ask you to rebuild the form. It gives that form somewhere to send its submissions, a dashboard to manage them, and a controlled way to show a client their own leads."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <section
                key={step.title}
                id={`step-${index + 1}`}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-foreground-muted uppercase">
                    Step {index + 1}
                  </span>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h2>
                <p className="text-sm leading-6 text-foreground-secondary">{step.body}</p>
                <ul className="mt-auto flex flex-col gap-1.5">
                  {step.detail.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-foreground-secondary">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={step.link.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                >
                  {step.link.label}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </section>
            );
          })}
        </div>

        <section aria-labelledby="flow-heading" className="flex flex-col gap-3">
          <h2 id="flow-heading" className="text-xl font-semibold tracking-tight text-foreground">
            The whole workflow on one line
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border bg-surface p-5">
            <p className="min-w-[560px] font-mono text-[12px] leading-7 text-foreground-secondary">
              Website form <span className="text-foreground-muted">→</span>{" "}
              <span className="text-foreground">Formivo endpoint</span>{" "}
              <span className="text-foreground-muted">→</span> validated submission{" "}
              <span className="text-foreground-muted">→</span>{" "}
              <span className="text-foreground">workspace dashboard</span>{" "}
              <span className="text-foreground-muted">→</span> client read-only view
            </p>
          </div>
        </section>

        <section aria-labelledby="limits-heading" className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-6">
            <h2 id="limits-heading" className="text-base font-semibold text-foreground">
              What Formivo does not do
            </h2>
            <ul className="flex flex-col gap-1.5 text-sm text-foreground-secondary">
              <li>It is not a form builder: your form markup stays yours.</li>
              <li>It does not send email notifications for new submissions yet.</li>
              <li>It has no native CRM sync, automation builder or webhooks yet.</li>
              <li>It does not support file uploads.</li>
              <li>Custom domains and white-label branding are not available.</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-accent/25 bg-accent-subtle/20 p-6">
            <p className="text-sm leading-6 text-foreground-secondary">
              Everything above is deliberate. The product covers the part that breaks first:
              receiving a submission reliably, keeping it organized, and putting it in front of the
              right person without sharing an account.
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/signup">Get started free</ButtonLink>
              <ButtonLink href="/pricing" variant="secondary">
                Explore pricing
              </ButtonLink>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
