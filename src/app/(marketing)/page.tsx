import { ArrowRight, BarChart3, Inbox, Lock, UserCheck, Users } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { PLANS } from "@/lib/billing/plans";

const features = [
  {
    icon: Inbox,
    title: "One endpoint per form",
    description:
      "Point any existing HTML form or server route at a Formivo endpoint. JSON is validated, rate limited and stored safely.",
  },
  {
    icon: Lock,
    title: "Secrets never stored in plaintext",
    description:
      "Form secrets are shown once and stored only as hashes. Rotate instantly if one leaks.",
  },
  {
    icon: Users,
    title: "Read-only client access",
    description:
      "Invite a client to one form. They see its leads and analytics — never your other forms, billing or secrets.",
  },
  {
    icon: BarChart3,
    title: "Answers, not dashboards",
    description:
      "Submission volume, status distribution and per-form totals. Enough to know how many leads you got this month.",
  },
];

const snippet = `// Your server route — the secret never reaches the browser
await fetch("https://your-app.com/api/f/FORM_ID/submissions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: \`Bearer \${process.env.FORMIVO_SECRET}\`,
  },
  body: JSON.stringify({
    data: { name, email, message },
    metadata: { page: "/contact" },
  }),
});`;

const steps = [
  {
    title: "Create a form",
    description: "Name it, get an endpoint and a one-time secret.",
  },
  {
    title: "Connect your form",
    description: "Forward submissions from your server with the secret in a header.",
  },
  {
    title: "Review and share",
    description: "Triage leads in the dashboard, then invite your client read-only.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border bg-surface">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground-secondary">
              <UserCheck className="size-3.5 text-accent" aria-hidden="true" />
              Built for developers shipping for clients
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              The form backend for developers who ship for clients.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-foreground-secondary">{siteConfig.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/signup" size="lg">
                Start free
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/docs" size="lg" variant="secondary">
                Read the docs
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-foreground-muted">
              Free plan: 3 forms, 100 submissions a month. No card required.
            </p>
          </div>
          <figure className="min-w-0 rounded-lg border border-border bg-foreground p-5 shadow-sm">
            <figcaption className="mb-3 font-mono text-xs text-foreground-muted">
              app/api/contact/route.ts
            </figcaption>
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-background sm:text-sm">
              <code>{snippet}</code>
            </pre>
          </figure>
        </Container>
      </section>

      <section aria-labelledby="features-heading">
        <Container className="py-16 sm:py-20">
          <h2 id="features-heading" className="text-2xl font-semibold tracking-tight">
            Everything after the submit button
          </h2>
          <p className="mt-2 max-w-2xl text-foreground-secondary">
            Formivo is not a form builder. It is the storage, triage and client-sharing layer behind
            the form you already have.
          </p>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <Card className="h-full">
                  <CardHeader>
                    <Icon className="mb-2 size-5 text-accent" aria-hidden="true" />
                    <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{description}</CardDescription>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="how-heading" className="border-y border-border bg-surface">
        <Container className="py-16 sm:py-20">
          <h2 id="how-heading" className="text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent-subtle text-sm font-semibold text-accent">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-foreground-secondary">{step.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="pricing-preview-heading">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="pricing-preview-heading" className="text-2xl font-semibold tracking-tight">
                Simple plans
              </h2>
              <p className="mt-2 text-foreground-secondary">
                Start free. Upgrade when your forms outgrow it.
              </p>
            </div>
            <Link href="/pricing" className="text-sm font-medium text-accent hover:underline">
              Compare plans
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[PLANS.free, PLANS.pro, PLANS.agency].map((plan) => (
              <Card key={plan.key}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-2xl font-semibold text-foreground">
                    ${plan.priceMonthly}
                    <span className="text-sm font-normal text-foreground-muted"> / month</span>
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    {plan.forms} forms · {plan.monthlyLeads.toLocaleString("en-US")} submissions ·{" "}
                    {plan.viewers} viewers
                  </p>
                  <ButtonLink
                    href="/signup"
                    variant={plan.key === "pro" ? "primary" : "secondary"}
                    size="sm"
                  >
                    {plan.key === "free" ? "Start free" : `Choose ${plan.name}`}
                  </ButtonLink>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border bg-surface">
        <Container className="flex flex-col items-start gap-4 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Your next client form deserves a real backend.
            </h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Create a workspace and send your first test submission in minutes.
            </p>
          </div>
          <ButtonLink href="/signup" size="lg">
            Create free workspace
            <ArrowRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
