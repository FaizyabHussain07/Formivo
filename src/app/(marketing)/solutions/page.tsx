import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { solutions } from "@/content/solutions";
import { canonicalUrl, socialImage } from "@/lib/seo";

const title = "Solutions: Formivo for Freelancers, Developers and Agencies";
const description =
  "How freelance developers, web developers, agencies and client projects use Formivo to collect form submissions, organize leads and share read-only client access.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/solutions" },
  openGraph: {
    title,
    description,
    url: canonicalUrl("/solutions"),
    images: [socialImage({ title: "Formivo for client work", subtitle: description })],
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/solutions", label: "Solutions" }]} />
      <Container className="flex flex-col gap-10 py-12 lg:py-16">
        <PageHeader
          eyebrow="Solutions"
          title="Built around the way client work actually arrives."
          description="Formivo is the same product for every audience: one endpoint per form, one dashboard for submissions, and read-only access scoped to a single client. What changes is which part of that workflow hurts most."
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {solutions.map((solution) => (
            <li
              key={solution.slug}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                <Link href={`/solutions/${solution.slug}`} className="hover:text-accent">
                  {solution.name}
                </Link>
              </h2>
              <p className="text-sm leading-6 text-foreground-secondary">{solution.answer}</p>
              <Link
                href={`/solutions/${solution.slug}`}
                className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-accent hover:underline"
              >
                Read the workflow
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Not sure which plan fits?</h2>
            <p className="mt-1 text-sm text-foreground-secondary">
              Every plan uses the same endpoint and the same client access model. Only the limits
              change.
            </p>
          </div>
          <ButtonLink href="/pricing" variant="secondary">
            Compare plans
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
