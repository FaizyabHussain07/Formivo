import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { alternativeBySlug, alternatives } from "@/content/alternatives";
import { SITE_URL, canonicalUrl, socialImage } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return alternatives.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = alternativeBySlug(slug);
  if (!item) return { title: "Comparison not found" };

  return {
    title: { absolute: `${item.seoTitle} | Formivo` },
    description: item.description,
    alternates: { canonical: `/alternatives/${item.slug}` },
    openGraph: {
      title: item.seoTitle,
      description: item.description,
      url: canonicalUrl(`/alternatives/${item.slug}`),
      type: "article",
      images: [
        socialImage({
          title: item.title,
          subtitle: item.summary,
          kind: "comparison",
        }),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: item.seoTitle,
      description: item.description,
      images: [socialImage({ title: item.title, subtitle: item.summary, kind: "comparison" })],
    },
    keywords: [
      `${item.competitor} alternative`,
      `${item.competitor} vs Formivo`,
      "form backend comparison",
      "form endpoint",
    ],
  };
}

export default async function AlternativePage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = alternativeBySlug(slug);
  if (!item) notFound();

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: item.title,
      description: item.description,
      url: canonicalUrl(`/alternatives/${item.slug}`),
      isPartOf: { "@type": "WebSite", name: "Formivo", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: item.faq.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: { "@type": "Answer", text: entry.answer },
      })),
    },
  ];

  return (
    <div className="flex flex-col">
      <Breadcrumbs
        items={[
          { href: "/alternatives", label: "Alternatives" },
          { href: `/alternatives/${item.slug}`, label: item.competitor },
        ]}
      />

      <Container className="flex max-w-3xl flex-col gap-8 py-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">vs {item.competitor}</Badge>
            <span className="text-xs text-foreground-muted">
              Competitor facts checked {item.verifiedOn}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {item.title}
          </h1>
          <p className="text-[15px] leading-7 text-foreground-secondary">{item.summary}</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What {item.competitor} offers
          </h2>
          <ul className="flex flex-col gap-2">
            {item.competitorFacts.map((fact) => (
              <li
                key={fact}
                className="relative pl-5 text-[15px] leading-7 text-foreground-secondary before:absolute before:top-[11px] before:left-0 before:size-1.5 before:rounded-full before:bg-foreground-muted/50"
              >
                {fact}
              </li>
            ))}
          </ul>
          <a
            href={item.competitorSource}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex w-fit items-center gap-1 text-sm text-accent hover:underline"
          >
            Source: {item.competitor} pricing page
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Who {item.competitor} suits
          </h2>
          <ul className="flex flex-col gap-1 text-[15px] leading-7 text-foreground-secondary">
            {item.bestFor.map((entry) => (
              <li key={entry}>• {entry}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Where Formivo works differently
          </h2>
          <ul className="flex flex-col gap-1 text-[15px] leading-7 text-foreground-secondary">
            {item.formivoDifference.map((entry) => (
              <li key={entry}>• {entry}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Side by side</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-surface-muted/60">
                <tr>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase">
                    Dimension
                  </th>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase">
                    Formivo
                  </th>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase">
                    {item.competitor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {item.comparison.map((row) => (
                  <tr key={row.dimension} className="border-t border-border">
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      {row.dimension}
                    </td>
                    <td className="px-4 py-3 align-top text-foreground-secondary">{row.formivo}</td>
                    <td className="px-4 py-3 align-top text-foreground-secondary">
                      {row.competitor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold text-foreground">Choose {item.competitor} if…</h2>
            <ul className="flex flex-col gap-1 text-sm leading-6 text-foreground-secondary">
              {item.chooseCompetitor.map((entry) => (
                <li key={entry}>• {entry}</li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-2 rounded-xl border border-accent/30 bg-accent-subtle/40 p-5">
            <h2 className="text-sm font-semibold text-foreground">Choose Formivo if…</h2>
            <ul className="flex flex-col gap-1 text-sm leading-6 text-foreground-secondary">
              {item.chooseFormivo.map((entry) => (
                <li key={entry}>• {entry}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Questions people ask
          </h2>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
            {item.faq.map((entry) => (
              <details key={entry.question} className="group px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                  {entry.question}
                </summary>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">{entry.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <aside className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground-secondary">
            Try the endpoint against your own form — 300 submissions a month on the free plan.
          </p>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Create a free account
          </Link>
        </aside>

        <Link
          href="/alternatives"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All comparisons
        </Link>

        <script
          type="application/ld+json"

          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Container>
    </div>
  );
}
