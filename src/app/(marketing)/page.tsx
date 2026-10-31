import {
  ArrowRight,
  BarChart3,
  Check,
  FileText,
  Inbox,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

import { CodeTabs } from "@/components/marketing/code-tabs";
import { Faq } from "@/components/marketing/faq";
import { faqItems } from "@/components/marketing/faq";
import { ProductPreview } from "@/components/marketing/product-preview";
import {
  JsonLd,
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/components/marketing/structured-data";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Formivo | Form Backend and Submission Management for Developers" },
  description:
    "Connect your existing website forms to Formivo. Receive submissions through a simple endpoint, manage leads in your dashboard, and share selected forms with clients.",
  alternates: { canonical: "/" },
};

const endpoint = `${siteConfig.productionUrl}/api/f/YOUR_FORM_ID`;

const htmlSnippet = `<form action="${endpoint}" method="POST">
  <label>
    Name
    <input type="text" name="name" required />
  </label>

  <label>
    Email
    <input type="email" name="email" required />
  </label>

  <label>
    Message
    <textarea name="message"></textarea>
  </label>

  <button type="submit">Send</button>
</form>`;

const jsSnippet = `const response = await fetch("${endpoint}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, email, message }),
});

if (response.ok) {
  showSuccess();
} else {
  const { error } = await response.json();
  showError(error.message);
}`;

const curlSnippet = `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "message": "Please call me back."
  }'`;

const steps = [
  {
    title: "Create a form",
    description: "Name it, and Formivo generates a random public endpoint. No API keys to invent.",
  },
  {
    title: "Point your form at it",
    description: "Reuse the form you already have. HTML, React, Vue, PHP or cURL — same endpoint.",
  },
  {
    title: "Collect submissions",
    description:
      "Formivo validates the request, applies rate limits, and stores the lead in your workspace.",
  },
  {
    title: "Manage leads and share",
    description:
      "Review, tag and search submissions, then invite your client to a read-only portal.",
  },
];

const features = [
  {
    icon: Zap,
    title: "One endpoint per form",
    description:
      "A single public URL accepts form-encoded and JSON submissions. Drop it into any site, stack or script.",
  },
  {
    icon: ShieldCheck,
    title: "Validation built in",
    description:
      "Body size, field count, nesting and value length are checked before anything is stored. Bad requests get clear 4xx errors.",
  },
  {
    icon: Lock,
    title: "Spam and rate limits",
    description:
      "Distributed per-form and per-IP limits, honeypot fields, idempotent retries and instant form pausing.",
  },
  {
    icon: Users,
    title: "Client-ready portal",
    description:
      "Invite a client to exactly one form. They see the leads and nothing else in your workspace.",
  },
  {
    icon: Search,
    title: "Searchable leads",
    description:
      "Filter by form, status or free text. Every submission keeps its full payload, metadata and source.",
  },
  {
    icon: BarChart3,
    title: "Usage you can see",
    description:
      "Track submissions over time and know exactly how close you are to your monthly limit.",
  },
];

const plans = [
  { name: "Free", price: "$0", blurb: "3 forms · 300 submissions/mo" },
  { name: "Pro", price: "$19", blurb: "10 forms · 2,000 submissions/mo", featured: true },
  { name: "Agency", price: "$49", blurb: "50 forms · 10,000 submissions/mo" },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={softwareApplicationSchema()} />
      <JsonLd data={faqPageSchema(faqItems)} />
      <section className="hero-grid relative overflow-hidden border-b border-border">
        <div
          className="dotted-grid pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
        />
        <Container className="relative grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:py-24">
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 text-xs font-medium text-accent-hover">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Lead infrastructure for modern websites
            </span>

            <h1 className="mt-5 text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground sm:text-5xl lg:text-[56px]">
              Your forms. Your backend. Your leads in one place.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground-secondary sm:text-lg">
              Connect your existing website forms to Formivo with a single endpoint. Collect
              submissions, manage leads, and share them with your clients without building another
              backend.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup" size="lg">
                Get started
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#how-it-works" size="lg" variant="secondary">
                See how it works
              </ButtonLink>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground-secondary">
              {["No form rebuild", "No backend to deploy", "Read-only client portal"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-accent" aria-hidden="true" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="relative">
            <ProductPreview />
            <div className="absolute -bottom-4 -left-4 hidden rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground-secondary shadow-lg sm:block">
              <span className="font-medium text-foreground">201 Created</span> · 148 ms
            </div>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="border-b border-border">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
                How it works
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Point the form you already have at one endpoint.
              </h2>
              <p className="max-w-lg text-base text-foreground-secondary">
                No new form builder, no client SDK, no keys. Create the form, copy the URL, ship.
              </p>
            </div>

            <ol className="flex flex-col gap-5">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent-subtle font-mono text-xs font-semibold text-accent">
                    {index + 1}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[15px] font-medium text-foreground">{step.title}</p>
                    <p className="text-sm text-foreground-secondary">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ButtonLink href="/docs" variant="secondary" size="sm" className="w-fit">
              Read the docs
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <CodeTabs
              tabs={[
                { id: "html", label: "HTML", language: "html", code: htmlSnippet },
                { id: "js", label: "JavaScript", language: "javascript", code: jsSnippet },
                { id: "curl", label: "cURL", language: "bash", code: curlSnippet },
              ]}
            />
            <p className="text-xs text-foreground-muted">
              The endpoint is public by design. Stored submissions are protected by workspace
              authorization, never by a hidden URL.
            </p>
          </div>
        </Container>
      </section>

      <section id="features" className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
                Features
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Everything after the submit button.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-foreground-secondary">
              The unglamorous parts of receiving form data — validation, abuse control, storage,
              permissions — handled.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5 transition-colors hover:border-border-strong"
              >
                <span className="flex size-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-subtle text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-foreground-secondary">{description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex min-w-0 flex-col gap-4">
            <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
              Security
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              A public endpoint. A private database.
            </h2>
            <p className="max-w-lg text-base text-foreground-secondary">
              Anyone can copy the URL from your website source. That is fine — the endpoint can only
              write a validated submission. Reading, updating and exporting require an authenticated
              workspace member.
            </p>
            <ul className="mt-2 flex flex-col gap-3 text-sm text-foreground-secondary">
              {[
                "Row Level Security on every table, enforced with server-side authorization.",
                "Workspaces and plans can never be overridden by client input.",
                "Distributed rate limits return 429 with Retry-After.",
                "Optional allowed-domain list for browser CORS — not a substitute for the real controls.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-ring min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a1a17] p-6 text-slate-200">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] tracking-wide text-slate-400">
                endpoint contract
              </p>
              <Badge tone="success">No API key</Badge>
            </div>
            <dl className="mt-5 flex flex-col gap-4 text-sm">
              {[
                ["POST /api/f/{formId}", "accepts form-encoded or JSON"],
                ["201 Created", "submission stored, leadId returned"],
                ["400 / 413 / 415", "invalid, too large, unsupported body"],
                ["404 / 409", "unknown or paused form"],
                ["429", "rate limited · Retry-After"],
                ["GET", "405 — the endpoint never reads data"],
              ].map(([key, value]) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="font-mono text-[12.5px] text-teal-300">{key}</dt>
                  <dd className="text-[13px] text-slate-400">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className="border-b border-border bg-surface">
        <Container className="flex flex-col gap-8 py-16 sm:py-20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Simple pricing that scales with your clients.
            </h2>
            <ButtonLink href="/pricing" variant="secondary" size="sm" className="w-fit">
              Compare plans
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <li
                key={plan.name}
                className={`flex flex-col gap-1 rounded-xl border p-5 ${
                  plan.featured
                    ? "border-accent bg-accent-subtle/40"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{plan.name}</p>
                  {plan.featured ? <Badge tone="accent">Most popular</Badge> : null}
                </div>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {plan.price}
                  <span className="text-xs font-normal text-foreground-muted"> / month</span>
                </p>
                <p className="text-xs text-foreground-muted">{plan.blurb}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="border-b border-border">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
              FAQ
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Questions, answered plainly.
            </h2>
            <p className="text-sm text-foreground-secondary">
              Something missing?{" "}
              <a
                className="font-medium text-accent hover:underline"
                href={`mailto:${siteConfig.contactEmail}`}
              >
                Email us
              </a>
              .
            </p>
          </div>
          <Faq />
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <div className="hero-grid surface-ring relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              className="dotted-grid pointer-events-none absolute inset-0 opacity-40"
              aria-hidden="true"
            />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl border border-accent/20 bg-accent-subtle text-accent">
                <FileText className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Forms to leads. Leads to clients.
              </h2>
              <p className="text-base text-foreground-secondary">
                Create a workspace, connect your first form, and see a submission in minutes. Free
                plan included, no card required.
              </p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/signup" size="lg">
                  Get started free
                  <ArrowRight aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/docs" size="lg" variant="secondary">
                  <Inbox aria-hidden="true" />
                  Read the docs
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
