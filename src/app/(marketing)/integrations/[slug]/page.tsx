import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { JsonLd } from "@/components/marketing/structured-data";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { findIntegration, integrations } from "@/content/integrations";
import { canonicalUrl, socialImage } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return integrations.map((integration) => ({ slug: integration.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const integration = findIntegration(slug);
  if (!integration) return { title: "Guide not found", robots: { index: false } };

  return {
    title: { absolute: integration.seoTitle },
    description: integration.description,
    alternates: { canonical: `/integrations/${integration.slug}` },
    openGraph: {
      title: integration.seoTitle,
      description: integration.description,
      url: canonicalUrl(`/integrations/${integration.slug}`),
      images: [
        socialImage({
          title: integration.title,
          subtitle: integration.description,
          kind: "guide",
        }),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: integration.seoTitle,
      description: integration.description,
    },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params;
  const integration = findIntegration(slug);
  if (!integration) notFound();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: integration.title,
          description: integration.description,
          totalTime: "PT5M",
          step: integration.steps.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: step,
            url: canonicalUrl(`/integrations/${integration.slug}#step-${index + 1}`),
          })),
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/integrations", label: "Integrations" },
          { href: `/integrations/${integration.slug}`, label: integration.name },
        ]}
      />

      <Container className="flex max-w-3xl flex-col gap-10 py-12 lg:py-16">
        <PageHeader
          eyebrow={`${integration.name} integration`}
          title={integration.title}
          description={integration.intro}
        />

        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Direct answer</h2>
          <p className="mt-2 text-sm leading-6 text-foreground-secondary">{integration.answer}</p>
        </section>

        <section aria-labelledby="req-heading" className="flex flex-col gap-2">
          <h2 id="req-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Before you start
          </h2>
          <ul className="flex flex-col gap-1.5">
            {integration.requirements.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground-secondary">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="steps-heading" className="flex flex-col gap-3">
          <h2 id="steps-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Steps
          </h2>
          <ol className="flex flex-col gap-2">
            {integration.steps.map((step, index) => (
              <li
                id={`step-${index + 1}`}
                key={step}
                className="flex gap-3 rounded-lg border border-border bg-surface p-4 text-sm text-foreground-secondary"
              >
                <span className="font-mono text-[11px] text-foreground-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>

        {integration.code.map((block) => (
          <figure
            key={block.title}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1a17]"
          >
            <figcaption className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
              <span>{block.title}</span>
              <span className="font-mono text-[10px] text-slate-500">{block.language}</span>
            </figcaption>
            <pre className="max-w-full overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">
              <code>{block.code}</code>
            </pre>
          </figure>
        ))}

        <section aria-labelledby="notes-heading" className="flex flex-col gap-2">
          <h2 id="notes-heading" className="text-lg font-semibold tracking-tight text-foreground">
            Worth knowing
          </h2>
          <ul className="flex flex-col gap-1.5 pl-5 text-sm text-foreground-secondary [&>li]:list-disc">
            {integration.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <ButtonLink href="/signup">Create a form</ButtonLink>
          <Link
            href={integration.docHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            Full documentation
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Link href="/integrations" className="text-sm text-foreground-secondary hover:text-foreground">
            All integrations
          </Link>
        </div>
      </Container>
    </>
  );
}
