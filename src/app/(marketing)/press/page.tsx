import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { siteConfig } from "@/config/site";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { canonicalUrl } from "@/lib/seo";

const title = "Formivo Press and Media Information";
const description =
  "Description, product facts and canonical links for anyone writing about Formivo, the form backend and lead workspace for client projects.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/press" },
  openGraph: { title, description, url: canonicalUrl("/press") },
};

const facts = [
  "Formivo is a form backend and lead workspace for freelance developers, web developers and agencies managing client websites.",
  "A form gets a public HTTPS endpoint that accepts JSON, urlencoded and multipart form data. No API key is embedded in the page.",
  "Submissions are stored in a workspace dashboard with search, per-form filters and six lead statuses.",
  "Clients can be invited to a single form and receive a read-only account scoped to it.",
  "Client access is enforced by server-side authorization and row-level security, and can be revoked per form.",
  "CSV export is available on Light, Pro and Agency plans.",
  "Email notifications, native CRM sync, webhooks, file uploads, custom domains and white-label branding are not available.",
];

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/press", label: "Press" }]} />
      <Container className="flex max-w-3xl flex-col gap-8 py-12 lg:py-16">
        <PageHeader
          eyebrow="Press"
          title="Formivo in one paragraph."
          description="Everything below can be quoted as written. If you need something that is not here, ask rather than infer it."
        />

        <section aria-labelledby="about-heading" className="flex flex-col gap-2">
          <h2 id="about-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Boilerplate
          </h2>
          <blockquote className="rounded-xl border border-border bg-surface p-5 text-sm leading-6 text-foreground-secondary">
            Formivo is a form backend and lead workspace built for client projects. Developers point
            an existing website form at a Formivo endpoint, receive submissions in a dashboard, and
            give each client read-only access to their own form&apos;s submissions. It is made for
            freelance developers and web agencies managing multiple client websites.
          </blockquote>
        </section>

        <section aria-labelledby="facts-heading" className="flex flex-col gap-2">
          <h2 id="facts-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Facts worth checking
          </h2>
          <ul className="flex flex-col gap-1.5 pl-5 text-sm text-foreground-secondary [&>li]:list-disc">
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pricing-heading" className="flex flex-col gap-2">
          <h2 id="pricing-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Pricing
          </h2>
          <ul className="flex flex-col gap-1.5 text-sm text-foreground-secondary">
            {PLAN_ORDER.map((key) => {
              const plan = PLANS[key];
              return (
                <li key={key}>
                  <span className="font-medium text-foreground">{plan.name}</span>: $
                  {plan.priceMonthly}/month, {plan.forms} active form
                  {plan.forms === 1 ? "" : "s"}, {plan.monthlyLeads.toLocaleString("en-US")}{" "}
                  submissions per month, {plan.viewers} client view{plan.viewers === 1 ? "" : "s"}.
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-foreground-muted">
            Paid plans are billed monthly by Paddle. See{" "}
            <Link href="/pricing" className="underline">
              pricing
            </Link>{" "}
            for the current source.
          </p>
        </section>

        <section aria-labelledby="links-heading" className="flex flex-col gap-2">
          <h2 id="links-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Canonical links
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {[
              { href: "/", label: "Website" },
              { href: "/features", label: "Features" },
              { href: "/pricing", label: "Pricing" },
              { href: "/client-portal", label: "Client portal" },
              { href: "/security", label: "Security" },
              { href: "/about", label: "About" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-accent hover:underline">
                  {canonicalUrl(link.href)}
                </Link>{" "}
                <span className="text-foreground-muted">— {link.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="assets-heading" className="flex flex-col gap-2">
          <h2 id="assets-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Assets and contact
          </h2>
          <p className="text-sm leading-6 text-foreground-secondary">
            The social card at{" "}
            <a href="/og-image.jpg" className="text-accent hover:underline">
              /og-image.jpg
            </a>{" "}
            is 1200×630. The logo is at{" "}
            <a href="/formivo-logo.png" className="text-accent hover:underline">
              /formivo-logo.png
            </a>
            . For interviews, corrections or anything else:{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-medium text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
            .
          </p>
          <p className="text-xs leading-5 text-foreground-muted">
            Please do not publish invented customer counts, ratings or certification claims. There
            are no certifications to cite, and any number not on this page should be verified with
            us first.
          </p>
        </section>
      </Container>
    </>
  );
}
