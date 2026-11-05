import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { alternatives } from "@/content/alternatives";

export const metadata: Metadata = {
  title: { absolute: "Form Backend Alternatives | Formivo Comparisons" },
  description:
    "Honest comparisons between Formivo and Formspree, Web3Forms, Formspark, Basin and FormSubmit — with competitor facts read from their own pages.",
  alternates: { canonical: "/alternatives" },
  keywords: [
    "formspree alternative",
    "web3forms alternative",
    "form backend alternatives",
    "formspark alternative",
  ],
  openGraph: {
    title: "Form backend alternatives, compared honestly",
    description:
      "Formivo next to Formspree, Web3Forms, Formspark, Basin and FormSubmit — including when each one is the better pick.",
    images: [
      socialImage({
        title: "Form backend alternatives, compared honestly",
        subtitle:
          "Formivo next to Formspree, Web3Forms, Formspark, Basin and FormSubmit — including when each one is the better pick.",
        kind: "comparison",
      }),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Form backend alternatives, compared honestly",
    description:
      "Formivo next to Formspree, Web3Forms, Formspark, Basin and FormSubmit — including when each one is the better pick.",
    images: [
      socialImage({
        title: "Form backend alternatives, compared honestly",
        subtitle:
          "Formivo next to Formspree, Web3Forms, Formspark, Basin and FormSubmit — including when each one is the better pick.",
      }),
    ],
  },
};

export default function AlternativesPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <Container className="flex flex-col gap-4 py-14">
          <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
            Alternatives
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Compare the workflow, not the marketing.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            Each page states what the other product does, links to its own pricing page, and names
            the cases where it is the better choice. Competitor facts are dated because prices
            change.
          </p>
          <p className="text-xs text-foreground-muted">
            Facts verified {alternatives[0]?.verifiedOn ?? "2026-11-05"} from each vendor&apos;s
            site.
          </p>
        </Container>
      </section>

      <Container className="py-12">
        <ul className="grid gap-4 sm:grid-cols-2">
          {alternatives.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/alternatives/${item.slug}`}
                className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <span className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                  vs {item.competitor}
                </span>
                <span className="text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </span>
                <span className="text-sm leading-6 text-foreground-secondary">{item.summary}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-accent">
                  Compare <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
