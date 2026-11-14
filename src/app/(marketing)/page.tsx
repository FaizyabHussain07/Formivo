import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CommunityFeedback } from "@/components/marketing/community-feedback";
import { Faq, faqItems } from "@/components/marketing/faq";
import { FeaturedBadges } from "@/components/marketing/featured-badges";
import { FinalCta } from "@/components/marketing/final-cta";
import { FounderSection } from "@/components/marketing/founder-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { ProblemSection } from "@/components/marketing/problem-section";
import { ProductDemo } from "@/components/marketing/product-demo";
import { ProductPreview } from "@/components/marketing/product-preview";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { SecuritySection } from "@/components/marketing/security-section";
import { SolutionSection } from "@/components/marketing/solution-section";
import {
  JsonLd,
  faqPageSchema,
  organizationSchema,
  softwareApplicationSchema,
  websiteSchema,
} from "@/components/marketing/structured-data";
import { TechnologyStrip } from "@/components/marketing/technology-strip";
import { UseCasesSection } from "@/components/marketing/use-cases-section";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SITE_SOCIAL_IMAGE, SITE_URL } from "@/lib/seo";

const title = "Form Backend for Developers & Agencies | Formivo";
const description =
  "Connect HTML, React and Next.js forms to Formivo. Collect submissions, manage leads and give clients their own private portal. Start free.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: `${SITE_URL}/` },
  keywords: [
    "form backend for developers",
    "form backend",
    "html form backend",
    "form submission backend",
    "form backend for agencies",
    "form backend for freelancers",
    "website form submission management",
    "form backend for React",
    "form backend for Next.js",
    "client portal for web agencies",
    "lead management for website forms",
    "contact form backend",
    "form submission management software",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Formivo",
    title,
    description,
    url: `${SITE_URL}/`,
    images: [SITE_SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [SITE_SOCIAL_IMAGE],
  },
  robots: { index: true, follow: true },
};

const trustPoints = ["No API keys", "No server to deploy", "Free plan, no card"];

const portalPoints = [
  "A client reads only the form you invited them to",
  "Read-only: no edits, no settings, no billing",
  "Revoking access ends it on the next request",
  "You keep the workspace, the leads and the control",
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <JsonLd data={softwareApplicationSchema()} />
      <JsonLd data={faqPageSchema(faqItems)} />

      <section
        aria-labelledby="hero-heading"
        className="marketing-wash relative overflow-hidden border-b border-border"
      >
        <div
          aria-hidden="true"
          className="marketing-grid pointer-events-none absolute inset-0 opacity-70"
        />
        <Container className="relative grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:gap-12 lg:py-24">
          <div className="flex flex-col items-start">
            <span className="animate-rise inline-flex items-center gap-2 rounded-full border border-accent/20 bg-surface/80 px-3 py-1 font-mono text-[10px] font-medium tracking-[0.14em] text-accent uppercase shadow-[0_1px_2px_rgb(11_31_42/0.04)] backdrop-blur">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Forms to leads. Leads to clients.
            </span>

            <h1
              id="hero-heading"
              className="animate-rise mt-6 max-w-2xl text-[2.6rem] leading-[1.03] font-semibold tracking-[-0.035em] text-balance text-foreground sm:text-5xl lg:text-[3.55rem]"
              style={{ animationDelay: "60ms" }}
            >
              Your forms collect leads. Formivo helps you manage what happens{" "}
              <span className="text-accent">next</span>.
            </h1>

            <p
              className="animate-rise mt-6 max-w-xl text-[15px] leading-7 text-foreground-secondary sm:text-[16.5px]"
              style={{ animationDelay: "120ms" }}
            >
              Connect your website forms, organize every submission and give your clients a clear
              place to view their leads. Built for freelance developers and agencies managing
              multiple websites, without a separate backend for every project.
            </p>

            <div
              className="animate-rise mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
              style={{ animationDelay: "180ms" }}
            >
              <ButtonLink href="/signup" size="lg">
                Get started free
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#demo" size="lg" variant="secondary">
                Watch product demo
              </ButtonLink>
            </div>

            <div
              className="animate-rise mt-7 flex flex-col gap-3"
              style={{ animationDelay: "240ms" }}
            >
              <p className="text-[13px] text-foreground-secondary">
                Built for freelancers, developers, and web agencies.
              </p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {trustPoints.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-1.5 text-[12px] text-foreground-muted"
                  >
                    <Check className="size-3.5 text-accent" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="animate-rise relative lg:pl-4" style={{ animationDelay: "300ms" }}>
            <ProductPreview />
          </div>
        </Container>
      </section>

      <TechnologyStrip />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <ProductShowcase />

      <section
        id="client-portal"
        aria-labelledby="client-portal-heading"
        className="scroll-mt-20 border-b border-border bg-surface-muted/30"
      >
        <Container className="grid gap-10 py-20 sm:py-24 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="flex flex-col gap-4">
            <span className="eyebrow">Client access</span>
            <h2
              id="client-portal-heading"
              className="max-w-lg text-3xl leading-[1.14] font-semibold tracking-[-0.022em] text-balance text-foreground sm:text-[2.1rem]"
            >
              Your clients see their leads. You stay in control.
            </h2>
            <p className="max-w-lg text-[14px] leading-7 text-foreground-secondary">
              Invite a client to one form. They get a read-only account scoped to that form, so you
              stop forwarding enquiries and they stop asking which email had the last one. Access is
              checked on every request and can be revoked at any time.
            </p>
            <ul className="flex flex-col gap-2">
              {portalPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-[13px] text-foreground-secondary"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <ButtonLink href="/client-portal" size="sm">
                See the client view
                <ArrowRight aria-hidden="true" />
              </ButtonLink>
              <Link
                href="/security"
                className="text-sm text-foreground-secondary hover:text-foreground"
              >
                How isolation is enforced
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-45px_rgb(11_31_28/0.5)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/50 px-4 py-3">
              <div className="flex flex-col leading-tight">
                <span className="text-[11.5px] font-medium text-foreground">
                  Studio Faizyab shared a form
                </span>
                <span className="text-[10px] text-foreground-muted">Northwind contact form</span>
              </div>
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[9.5px] text-foreground-muted">
                Read only
              </span>
            </div>
            <ul className="divide-y divide-border">
              {[
                ["Amelia Hart", "amelia@northwind.co", "New"],
                ["Daniel Osei", "d.osei@brightlane.io", "Contacted"],
                ["Priya Raman", "priya@vertex.studio", "Qualified"],
              ].map(([name, email, status]) => (
                <li key={email} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-medium text-foreground">{name}</p>
                    <p className="truncate text-[10px] text-foreground-muted">{email}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[9.5px] text-foreground-secondary">
                    {status}
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-border px-4 py-2 text-[9.5px] text-foreground-muted">
              This account cannot open another form, change a status or see billing.
            </p>
          </div>
        </Container>
      </section>

      <ProductDemo />
      <CommunityFeedback />
      <FounderSection />
      <UseCasesSection />
      <SecuritySection />
      <PricingPreview />

      <section id="faq" className="border-b border-border bg-surface-muted/40">
        <Container className="grid gap-8 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="eyebrow">FAQ</span>
            <h2 className="mt-4 max-w-md text-3xl leading-[1.14] font-semibold tracking-[-0.022em] text-balance text-foreground sm:text-[2.1rem]">
              Questions developers ask about Formivo.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-7 text-foreground-secondary">
              Direct answers, including the things Formivo does not do yet. If something is still
              unclear, ask us. A real person replies.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Contact the team
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <span aria-hidden="true" className="text-border-strong">
                ·
              </span>
              <Link
                href="/docs"
                className="text-sm text-foreground-secondary hover:text-foreground"
              >
                Read the docs
              </Link>
            </div>
          </div>
          <Faq />
        </Container>
      </section>

      <section aria-labelledby="featured-heading" className="border-b border-border">
        <Container className="flex flex-col gap-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="eyebrow">Featured on</span>
              <h2
                id="featured-heading"
                className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground"
              >
                Listed on the launch directories developers actually read.
              </h2>
            </div>
            <Link
              href="/featured-on"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              All listings
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <FeaturedBadges compact />
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
