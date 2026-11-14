import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { JsonLd } from "@/components/marketing/structured-data";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { findSolution, solutions } from "@/content/solutions";
import { canonicalUrl, socialImage } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const solution = findSolution(slug);
  if (!solution) return { title: "Solution not found", robots: { index: false } };

  return {
    title: { absolute: solution.seoTitle },
    description: solution.description,
    alternates: { canonical: `/solutions/${solution.slug}` },
    openGraph: {
      title: solution.seoTitle,
      description: solution.description,
      url: canonicalUrl(`/solutions/${solution.slug}`),
      images: [socialImage({ title: solution.title, subtitle: solution.answer, kind: "product" })],
    },
    twitter: {
      card: "summary_large_image",
      title: solution.seoTitle,
      description: solution.description,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const solution = findSolution(slug);
  if (!solution) notFound();

  const others = solutions.filter((item) => item.slug !== solution.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: solution.title,
          description: solution.description,
          url: canonicalUrl(`/solutions/${solution.slug}`),
          isPartOf: { "@type": "WebSite", name: "Formivo", url: canonicalUrl("/") },
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/solutions", label: "Solutions" },
          { href: `/solutions/${solution.slug}`, label: solution.name },
        ]}
      />

      <Container className="flex flex-col gap-12 py-12 lg:py-16">
        <PageHeader eyebrow={solution.name} title={solution.title} description={solution.intro} />

        <section aria-labelledby="answer-heading" className="flex flex-col gap-3">
          <h2 id="answer-heading" className="text-xl font-semibold tracking-tight text-foreground">
            The short answer
          </h2>
          <p className="max-w-3xl text-[15px] leading-7 text-foreground-secondary">
            {solution.answer}
          </p>
        </section>

        <section aria-labelledby="problems-heading" className="flex flex-col gap-4">
          <h2 id="problems-heading" className="text-xl font-semibold tracking-tight text-foreground">
            What usually goes wrong
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {solution.painPoints.map((point) => (
              <li key={point.title} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
                <h3 className="text-sm font-semibold text-foreground">{point.title}</h3>
                <p className="text-sm leading-6 text-foreground-secondary">{point.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="workflow-heading" className="flex flex-col gap-4">
          <h2
            id="workflow-heading"
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            How it works in practice
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {solution.workflow.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
                <span className="font-mono text-[10px] tracking-[0.14em] text-foreground-muted uppercase">
                  Step {index + 1}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-6 text-foreground-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="outcomes-heading"
          className="grid gap-6 rounded-2xl border border-accent/25 bg-accent-subtle/25 p-6 lg:grid-cols-2"
        >
          <div className="flex flex-col gap-3">
            <h2
              id="outcomes-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              What you get
            </h2>
            <ul className="flex flex-col gap-2">
              {solution.outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-foreground">{solution.scenario.title}</h3>
            <p className="text-sm leading-6 text-foreground-secondary">{solution.scenario.body}</p>
          </div>
        </section>

        <section aria-labelledby="next-heading" className="flex flex-col gap-4">
          <h2 id="next-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Keep reading
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {solution.relatedLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground-secondary transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {link.label}
                  <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground-secondary">
            Start with the free plan, or read how the{" "}
            {others[0] ? (
              <Link href={`/solutions/${others[0].slug}`} className="text-accent hover:underline">
                {others[0].name.toLowerCase()} workflow
              </Link>
            ) : null}{" "}
            differs.
          </p>
          <div className="flex gap-2">
            <ButtonLink href="/signup">Get started free</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">
              Pricing
            </ButtonLink>
          </div>
        </div>
      </Container>
    </>
  );
}
