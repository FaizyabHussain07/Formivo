import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { guideBySlug, guides } from "@/content/guides";
import { SITE_URL, canonicalUrl, socialImage } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Guide not found" };

  return {
    title: { absolute: `${guide.seoTitle} | Formivo` },
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.seoTitle,
      description: guide.description,
      url: canonicalUrl(`/guides/${guide.slug}`),
      type: "article",
      images: [
        socialImage({
          title: guide.title,
          subtitle: guide.summary,
          kind: "guide",
        }),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.seoTitle,
      description: guide.description,
      images: [socialImage({ title: guide.title, subtitle: guide.summary, kind: "guide" })],
    },
    keywords: [
      `${guide.language} form backend`,
      `${guide.language} form to backend`,
      `handle form submission ${guide.language}`,
      "form endpoint",
    ],
  };
}

export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const related = guide.related
    .map((relatedSlug) => guideBySlug(relatedSlug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: guide.title,
    description: guide.description,
    proficiencyLevel: "Beginner",
    dependency: guide.requirements.join(", "),
    author: { "@type": "Organization", name: "Formivo", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Formivo", url: SITE_URL },
    mainEntityOfPage: canonicalUrl(`/guides/${guide.slug}`),
  };

  return (
    <div className="flex flex-col">
      <Breadcrumbs
        items={[
          { href: "/guides", label: "Guides" },
          { href: `/guides/${guide.slug}`, label: guide.language },
        ]}
      />

      <Container className="flex max-w-3xl flex-col gap-6 py-10">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{guide.language}</Badge>
          <span className="text-xs text-foreground-muted">5 minute setup</span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
          {guide.title}
        </h1>
        <p className="text-[15px] leading-7 text-foreground-secondary">{guide.summary}</p>

        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Requirements</h2>
          <ul className="flex flex-col gap-1 text-sm text-foreground-secondary">
            {guide.requirements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Setup</h2>
          <ol className="flex flex-col gap-2">
            {guide.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-[15px] leading-7 text-foreground-secondary">
                <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-xs font-semibold text-foreground">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Code</h2>
          <figure className="overflow-hidden rounded-xl border border-white/10 bg-[#0a1a17]">
            <figcaption className="border-b border-white/10 px-4 py-2 text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
              {guide.language}
            </figcaption>
            <pre className="max-w-full overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">
              <code>{guide.code}</code>
            </pre>
          </figure>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What you get back
          </h2>
          <p className="text-[15px] leading-7 text-foreground-secondary">{guide.response}</p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Troubleshooting</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-surface-muted/60">
                <tr>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase">
                    Symptom
                  </th>
                  <th scope="col" className="px-4 py-2 text-xs font-semibold uppercase">
                    Fix
                  </th>
                </tr>
              </thead>
              <tbody>
                {guide.troubleshooting.map((entry) => (
                  <tr key={entry.problem} className="border-t border-border">
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      {entry.problem}
                    </td>
                    <td className="px-4 py-3 align-top text-foreground-secondary">{entry.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {related.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Related guides</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/guides/${entry.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground"
                  >
                    {entry.language}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <aside className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground-secondary">
            Need the full endpoint contract? Status codes, limits and headers are documented.
          </p>
          <Link
            href="/docs#endpoint"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Read the docs
          </Link>
        </aside>

        <Link
          href="/guides"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All guides
        </Link>

        <script
          type="application/ld+json"

          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Container>
    </div>
  );
}
