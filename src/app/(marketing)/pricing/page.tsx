import { Check } from "lucide-react";
import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PLANS, PLAN_ORDER, type PlanKey } from "@/lib/billing/plans";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = {
  title: { absolute: "Formivo Pricing | Plans for Developers and Agencies" },
  description:
    "Compare Formivo plans for form endpoints, submissions, client access, and form management. Choose a plan that fits your workflow.",
  alternates: { canonical: "/pricing" },
  keywords: ["form backend pricing","formspree pricing comparison","form backend plans","client portal pricing"],
  openGraph: {
    title: "Formivo pricing | Form backend plans for developers and agencies",
    description: "Three plans, one product: public form endpoints, submission management, CSV export and read-only client access. Free plan, no card.",
    images: [socialImage({ title: "Formivo pricing | Form backend plans for developers and agencies", subtitle: "Three plans, one product: public form endpoints, submission management, CSV export and read-only client access. Free plan, no card.", kind: "product" })],
  },
  twitter: {
    card: "summary_large_image",
    title: "Formivo pricing | Form backend plans for developers and agencies",
    description: "Three plans, one product: public form endpoints, submission management, CSV export and read-only client access. Free plan, no card.",
    images: [socialImage({ title: "Formivo pricing | Form backend plans for developers and agencies", subtitle: "Three plans, one product: public form endpoints, submission management, CSV export and read-only client access. Free plan, no card." })],
  },
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
      "New submissions are rejected with a quota error until the allowance resets at the start of your next billing cycle (the same date each month) or until you upgrade. Existing leads and history are always retained.",
  },
  {
    question: "When does my monthly allowance reset?",
    answer:
      "On the anniversary of your subscription date, not on the 1st of the calendar month: subscribe on the 14th and the allowance renews on the 14th. Free workspaces reset on the 1st, in UTC.",
  },
  {
    question: "Can I export submissions?",
    answer:
      "CSV export is included on Pro and Agency. The Free plan cannot export, and the restriction is enforced by the server, not just hidden in the interface. Exports are also limited to forms you own or were invited to view.",
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
    <Container className="flex flex-col gap-14 py-14 sm:py-20">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 text-xs font-medium text-accent-hover">
          Simple pricing
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-[42px] sm:leading-tight">
          Fair limits, no per-seat games.
        </h1>
        <p className="max-w-xl text-base text-foreground-secondary">
          Start free and upgrade only when you need more forms, submissions or client viewers. Every
          plan includes the same endpoint, validation and abuse protection.
        </p>
      </header>{" "}
      <div id="plans" className="grid scroll-mt-24 gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const featured = key === "pro";
          return (
            <section
              key={plan.key}
              aria-labelledby={`plan-${plan.key}`}
              className={cn(
                "relative flex flex-col gap-5 rounded-2xl border bg-surface p-6",
                featured
                  ? "border-accent/60 shadow-[0_16px_40px_-24px_rgb(15_118_110/0.45)]"
                  : "border-border shadow-[0_1px_2px_rgb(11_31_28/0.04)]",
              )}
            >
              {featured ? (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                  Most popular
                </span>
              ) : null}
              <div className="flex flex-col gap-1">
                <h2 id={`plan-${plan.key}`} className="text-[15px] font-semibold text-foreground">
                  {plan.name}
                </h2>
                <p className="text-sm text-foreground-secondary">{plan.description}</p>
              </div>
              <p className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  ${plan.priceMonthly}
                </span>
                <span className="text-sm text-foreground-muted">/ month</span>
              </p>
              <ul className="flex flex-1 flex-col gap-2.5 text-sm text-foreground-secondary">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={key === "free" ? "/signup" : "/signup"}
                variant={featured ? "primary" : "secondary"}
              >
                {key === "free" ? "Start free" : `Choose ${plan.name}`}
              </ButtonLink>
              <p className="text-center text-xs text-foreground-muted">
                {key === "free"
                  ? "No card required."
                  : "Secure checkout via Lemon Squeezy. Cancel anytime."}
              </p>
            </section>
          );
        })}
      </div>
      <section
        id="compare"
        aria-labelledby="compare-heading"
        className="flex scroll-mt-24 flex-col gap-4"
      >
        <h2 id="compare-heading" className="text-xl font-semibold tracking-tight">
          Compare the plans
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-surface-muted/60">
              <tr>
                <th scope="col" className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                  Capability
                </th>
                {PLAN_ORDER.map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-4 py-3 text-xs font-semibold tracking-wide uppercase"
                  >
                    {PLANS[key].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Price", render: (key: PlanKey) => `$${PLANS[key].priceMonthly}/mo` },
                { label: "Active forms", render: (key: PlanKey) => String(PLANS[key].forms) },
                {
                  label: "Submissions per month",
                  render: (key: PlanKey) => PLANS[key].monthlyLeads.toLocaleString("en-US"),
                },
                { label: "Client viewers", render: (key: PlanKey) => String(PLANS[key].viewers) },
                {
                  label: "CSV export",
                  render: (key: PlanKey) =>
                    PLANS[key].canExportSubmissions ? "Included" : "Not available",
                },
                { label: "Public endpoints", render: () => "Unlimited calls" },
                { label: "Rate limits and spam controls", render: () => "Included" },
                { label: "Per-form client permissions", render: () => "Included" },
                {
                  label: "Support",
                  render: (key: PlanKey) => (key === "free" ? "Community" : "Email"),
                },
              ].map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <th scope="row" className="px-4 py-3 text-left font-medium text-foreground">
                    {row.label}
                  </th>
                  {PLAN_ORDER.map((key) => (
                    <td key={key} className="px-4 py-3 text-foreground-secondary">
                      {row.render(key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section id="faq" aria-labelledby="faq-heading" className="flex scroll-mt-24 flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold tracking-tight">
          Frequently asked questions
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {faqs.map((faq) => (
            <div key={faq.question} className="flex flex-col gap-1 p-5">
              <p className="font-medium text-foreground">{faq.question}</p>
              <p className="text-sm text-foreground-secondary">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">Need something larger?</p>
          <p className="text-sm text-foreground-secondary">
            Tell us about your volume, custom domains or compliance requirements.
          </p>
        </div>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </Container>
  );
}
