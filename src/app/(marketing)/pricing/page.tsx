import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { TrackView } from "@/components/analytics/track-view";
import { JsonLd } from "@/components/marketing/structured-data";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getPaymentAvailability } from "@/lib/billing/availability";
import { PLANS, PLAN_ORDER, type PlanKey } from "@/lib/billing/plans";
import { canonicalUrl, socialImage } from "@/lib/seo";
import { cn } from "@/lib/utils/cn";

const seoTitle = "Formivo Pricing: Free, Light, Pro and Agency Plans";
const seoDescription =
  "Formivo pricing in USD, billed monthly: Free, $9 Light, $19 Pro and $49 Agency. Compare forms, monthly submissions, client views and CSV export for each plan.";

export const metadata: Metadata = {
  title: { absolute: seoTitle },
  description: seoDescription,
  alternates: { canonical: "/pricing" },
  keywords: [
    "form backend pricing",
    "form backend plans",
    "formspree pricing comparison",
    "client portal pricing",
    "form submission management pricing",
  ],
  openGraph: {
    title: seoTitle,
    description: seoDescription,
    url: canonicalUrl("/pricing"),
    images: [socialImage({ title: "Formivo pricing", subtitle: seoDescription, kind: "product" })],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: [socialImage({ title: "Formivo pricing", subtitle: seoDescription, kind: "product" })],
  },
};

const faqs = [
  {
    question: "What counts as a submission?",
    answer:
      "Every accepted request to a form endpoint counts once against the monthly limit. A duplicate retry with the same Idempotency-Key does not count twice. Rejected requests, such as a honeypot hit, do not count.",
  },
  {
    question: "What happens if I hit my monthly limit?",
    answer:
      "New submissions are rejected with a 409 quota error until the allowance resets or you upgrade. Existing leads and history are retained. Nothing is silently discarded, and the form keeps working again when the window resets.",
  },
  {
    question: "When does my monthly allowance reset?",
    answer:
      "On the anniversary of your subscription date for paid plans: subscribe on the 14th and the allowance renews on the 14th. Free workspaces reset on the 1st of each month in UTC.",
  },
  {
    question: "What is a client view?",
    answer:
      "A client account you invite to read one form's submissions. It is read-only, cannot see your other forms, and can be revoked per form. Client views are counted per workspace, not per form.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Not yet. Only monthly prices are configured, so there is no annual discount to show. When annual prices exist they will be listed on this page rather than promised in advance.",
  },
  {
    question: "Is there a team seat?",
    answer:
      "No. A workspace has one owner account, and client views are read-only accounts rather than seats. Multi-user team access is not implemented, so no plan sells it.",
  },
  {
    question: "How does billing work?",
    answer:
      "Paid plans are billed monthly in USD by Paddle, the merchant of record. Paddle handles payment methods, invoices and tax. Your card details never reach Formivo servers.",
  },
  {
    question: "How do I cancel or downgrade?",
    answer:
      "Open the Paddle customer portal from your billing page. Access continues to the end of the paid period, then the workspace returns to Free limits. Forms, submissions and client records are kept; existing data is never deleted on cancellation.",
  },
];

const rows: { label: string; render: (key: PlanKey) => string }[] = [
  { label: "Price per month", render: (key) => (PLANS[key].priceMonthly === 0 ? "$0" : `$${PLANS[key].priceMonthly}`) },
  { label: "Active forms", render: (key) => String(PLANS[key].forms) },
  { label: "Submissions per month", render: (key) => PLANS[key].monthlyLeads.toLocaleString("en-US") },
  { label: "Client views", render: (key) => String(PLANS[key].viewers) },
  {
    label: "Search and filtering",
    render: (key) => (key === "free" ? "Basic" : "Included"),
  },
  {
    label: "CSV export",
    render: (key) => (PLANS[key].canExportSubmissions ? "Included" : "Not included"),
  },
  { label: "Submission statuses", render: () => "Included" },
  { label: "Validation and rate limits", render: () => "Included" },
  { label: "Per-form client permissions", render: () => "Included" },
  { label: "Team seats", render: () => "1 owner" },
  { label: "Support", render: (key) => (key === "free" ? "Email, best effort" : key === "light" ? "Email" : "Priority email") },
];

export default function Page() {
  const payments = getPaymentAvailability();

  return (
    <Container className="flex flex-col gap-14 py-14 sm:py-20">
      <TrackView event="pricing_viewed" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Formivo",
          description: seoDescription,
          url: canonicalUrl("/pricing"),
          offers: PLAN_ORDER.map((key) => ({
            "@type": "Offer",
            name: `${PLANS[key].name} plan`,
            price: PLANS[key].priceMonthly,
            priceCurrency: "USD",
            description: PLANS[key].description,
            url: canonicalUrl("/pricing"),
            availability: "https://schema.org/InStock",
          })),
        }}
      />

      <header className="flex flex-col items-center gap-4 text-center">
        <span className="rounded-full border border-accent/25 bg-accent-subtle px-3 py-1 text-xs font-medium text-accent-hover">
          Simple pricing
        </span>
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-[42px] sm:leading-tight">
          Pay for forms and submissions. Everything else is included.
        </h1>
        <p className="max-w-xl text-base text-foreground-secondary">
          Every plan includes the same public endpoint, validation, spam controls and client access
          model. Monthly prices in USD, billed through Paddle. No annual plans yet.
        </p>
      </header>

      <div id="plans" className="grid scroll-mt-24 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((key) => {
          const plan = PLANS[key];
          const featured = plan.featured;
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
                href={key === "free" ? "/signup" : `/checkout/${key}`}
                variant={featured ? "primary" : "secondary"}
              >
                {key === "free" ? "Start free" : `Choose ${plan.name}`}
              </ButtonLink>
              <p className="text-center text-xs text-foreground-muted">
                {key === "free"
                  ? "No card required."
                  : payments.checkoutEnabled
                    ? payments.note
                    : "Paid checkout is not open on this deployment yet. Create a free account and keep your data."}
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
          Compare every limit
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
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
              {rows.map((row) => (
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
        <p className="text-xs leading-5 text-foreground-muted">
          Limits are enforced on the server, including at ingest. When a submission limit is
          reached, requests are refused with a clear error and existing data is kept. See{" "}
          <Link href="/docs/submissions" className="underline">
            submission limits
          </Link>{" "}
          for the exact behavior.
        </p>
      </section>

      <section id="faq" aria-labelledby="faq-heading" className="flex scroll-mt-24 flex-col gap-4">
        <h2 id="faq-heading" className="text-xl font-semibold tracking-tight">
          Pricing questions
        </h2>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-5">
              <summary className="cursor-pointer font-medium text-foreground">{faq.question}</summary>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">Need something larger?</p>
          <p className="text-sm text-foreground-secondary">
            Tell us about your volume and we will say plainly whether Formivo fits.
          </p>
        </div>
        <ButtonLink href="/contact" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </Container>
  );
}
