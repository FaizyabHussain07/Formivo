import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { comparisons } from "@/content/comparisons";

const title = "Formivo comparisons: form backends and form builders";
const description =
  "How Formivo compares with FormSubmit, Formspree, Basin, Tally, Typeform and Fillout. Written around the workflow after a submission, not a feature checklist.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/compare" },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/compare", label: "Comparisons" }]} />
      <Container className="flex flex-col gap-10 py-12 lg:py-16">
        <PageHeader
          eyebrow="Comparisons"
          title="Different tools for different halves of the job."
          description="A form builder hosts the form. A form backend receives what the form sends. Formivo is the second category, and these pages say where that fits and where it does not."
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {comparisons.map((comparison) => (
            <li
              key={comparison.slug}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
            >
              <span className="font-mono text-[10px] tracking-[0.12em] text-foreground-muted uppercase">
                {comparison.category}
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                <Link href={`/compare/${comparison.slug}`} className="hover:text-accent">
                  Formivo vs {comparison.competitor}
                </Link>
              </h2>
              <p className="text-sm leading-6 text-foreground-secondary">{comparison.summary}</p>
              <Link
                href={`/compare/${comparison.slug}`}
                className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-accent hover:underline"
              >
                Read the comparison
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="max-w-3xl text-xs leading-5 text-foreground-muted">
          Competitor names are used for identification only. Every page links to the provider&apos;s
          own pricing page so the current limits and features can be checked at the source. No
          comparison on this site claims a competitor&apos;s rating, review count or unverified
          capability.
        </p>
      </Container>
    </>
  );
}
