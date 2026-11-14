import { ArrowRight, Check, ExternalLink, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { JsonLd, faqPageSchema } from "@/components/marketing/structured-data";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { comparisons, findComparison } from "@/content/comparisons";
import { canonicalUrl, socialImage } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return comparisons.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const comparison = findComparison(slug);
  if (!comparison) return { title: "Comparison not found", robots: { index: false } };

  return {
    title: { absolute: comparison.seoTitle },
    description: comparison.description,
    alternates: { canonical: `/compare/${comparison.slug}` },
    openGraph: {
      title: comparison.seoTitle,
      description: comparison.description,
      url: canonicalUrl(`/compare/${comparison.slug}`),
      images: [
        socialImage({
          title: `Formivo vs ${comparison.competitor}`,
          subtitle: comparison.answer,
          kind: "comparison",
        }),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: comparison.seoTitle,
      description: comparison.description,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const comparison = findComparison(slug);
  if (!comparison) notFound();

  const others = comparisons.filter((item) => item.slug !== comparison.slug).slice(0, 4);

  return (
    <>
      <JsonLd data={faqPageSchema(comparison.faq)} />
      <Breadcrumbs
        items={[
          { href: "/compare", label: "Comparisons" },
          { href: `/compare/${comparison.slug}`, label: `vs ${comparison.competitor}` },
        ]}
      />

      <Container className="flex flex-col gap-12 py-12 lg:py-16">
        <PageHeader
          eyebrow={`${comparison.category} comparison`}
          title={comparison.title}
          description={comparison.summary}
        />

        <section aria-labelledby="answer-heading" className="flex flex-col gap-3">
          <h2 id="answer-heading" className="text-xl font-semibold tracking-tight text-foreground">
            The short answer
          </h2>
          <p className="max-w-3xl text-[15px] leading-7 text-foreground-secondary">
            {comparison.answer}
          </p>
        </section>

        <section aria-labelledby="table-heading" className="flex flex-col gap-3">
          <h2 id="table-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Side by side
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface-muted/60">
                <tr>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Dimension
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Formivo
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    {comparison.competitor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.rows.map((row) => (
                  <tr key={row.dimension} className="border-t border-border">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-foreground">
                      {row.dimension}
                    </th>
                    <td className="px-4 py-3 text-foreground-secondary">{row.formivo}</td>
                    <td className="px-4 py-3 text-foreground-secondary">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="fit-heading" className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6">
            <h2 id="fit-heading" className="text-base font-semibold text-foreground">
              Choose {comparison.competitor} when
            </h2>
            <ul className="flex flex-col gap-2">
              {comparison.bestFor.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <X className="mt-0.5 size-4 shrink-0 text-foreground-muted" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-accent/25 bg-accent-subtle/20 p-6">
            <h2 className="text-base font-semibold text-foreground">Choose Formivo when</h2>
            <ul className="flex flex-col gap-2">
              {comparison.formivoFit.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="verify-heading" className="flex flex-col gap-3">
          <h2 id="verify-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Check these on the provider&apos;s site
          </h2>
          <p className="text-sm text-foreground-secondary">
            This page describes workflows, not a snapshot of someone else&apos;s plan limits. Those
            change, so the source is the only reliable answer:
          </p>
          <a
            href={comparison.competitorUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            {comparison.competitor} pricing and features
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
          <ul className="flex flex-col gap-1.5 pl-5 text-sm text-foreground-secondary [&>li]:list-disc">
            {comparison.verify.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq-heading" className="flex flex-col gap-4">
          <h2 id="faq-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Common questions
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {comparison.faq.map((item) => (
              <details key={item.question} className="group px-5 py-4">
                <summary className="cursor-pointer text-sm font-medium text-foreground">
                  {item.question}
                </summary>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground-secondary">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="more-heading" className="flex flex-col gap-3 border-t border-border pt-8">
          <h2 id="more-heading" className="text-base font-semibold text-foreground">
            Other comparisons
          </h2>
          <ul className="flex flex-wrap gap-2">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/compare/${item.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground-secondary hover:border-border-strong hover:text-foreground"
                >
                  vs {item.competitor}
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <ButtonLink href="/signup">Get started free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">
              See the plans
            </ButtonLink>
          </div>
        </section>
      </Container>
    </>
  );
}
