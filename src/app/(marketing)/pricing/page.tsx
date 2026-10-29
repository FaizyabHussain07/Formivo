import { Check } from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Formivo pricing: a free plan for small projects, Pro for freelancers and Agency for teams managing many client forms.",
};

const faqs = [
  {
    question: "What counts as a submission?",
    answer:
      "Every accepted request to a form endpoint counts once against the monthly limit. Duplicate retries with the same Idempotency-Key do not count twice.",
  },
  {
    question: "What happens if I hit my monthly limit?",
    answer:
      "New submissions are rejected with a QUOTA_EXCEEDED error until the next calendar month or until you upgrade. Existing leads and history are always retained.",
  },
  {
    question: "What is a client viewer?",
    answer:
      "A client account you invite to read one form's leads and analytics. Viewers cannot edit leads, change form settings, manage billing or see your other forms.",
  },
  {
    question: "Can I cancel or downgrade?",
    answer:
      "Yes. Cancel from the billing page's customer portal. Your data stays, but creating new forms or viewers beyond the lower plan limit is blocked.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "If something is not working for you, contact us and we will help. Subscription billing is handled by Lemon Squeezy.",
  },
];

export default function Page() {
  return (
    <Container className="flex flex-col gap-12 py-12">
      <PageHeader
        title="Pricing"
        description="Fair limits, no per-seat games. Start free and upgrade only when you need more forms, submissions or client viewers."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          return (
            <section
              key={plan.key}
              aria-labelledby={`plan-${plan.key}`}
              className={cn(
                "flex flex-col gap-4 rounded-lg border bg-surface p-6 shadow-xs",
                key === "pro" ? "border-accent" : "border-border",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 id={`plan-${plan.key}`} className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h2>
                {key === "pro" ? (
                  <span className="rounded-sm bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">
                    Most popular
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-foreground-secondary">{plan.description}</p>
              <p className="text-3xl font-semibold tracking-tight text-foreground">
                ${plan.priceMonthly}
                <span className="text-sm font-normal text-foreground-muted"> / month</span>
              </p>
              <ul className="flex flex-1 flex-col gap-2 text-sm text-foreground-secondary">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/signup" variant={key === "pro" ? "primary" : "secondary"}>
                {key === "free" ? "Start free" : `Choose ${plan.name}`}
              </ButtonLink>
              <p className="text-xs text-foreground-muted">
                {key === "free"
                  ? "No card required."
                  : "Secure checkout via Lemon Squeezy. Cancel anytime."}
              </p>
            </section>
          );
        })}
      </div>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <dl className="divide-y divide-border rounded-lg border border-border bg-surface">
          {faqs.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-1 p-5">
              <dt className="font-medium text-foreground">{faq.question}</dt>
              <dd className="text-sm text-foreground-secondary">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground-secondary">
          Need something larger, or have a question about limits? We are happy to talk.
        </p>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </Container>
  );
}
