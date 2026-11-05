import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { ContentBlocks, headingId } from "@/components/content/blocks";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { blogPosts, postBySlug, relatedPosts } from "@/content/blog";
import { SITE_URL, canonicalUrl, socialImage } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) return { title: "Article not found" };

  return {
    title: { absolute: `${post.seoTitle} | Formivo` },
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: canonicalUrl(`/blog/${post.slug}`),
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      tags: post.tags,
      images: [
        socialImage({
          title: post.title,
          subtitle: post.description,
          kind: "blog",
        }),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.description,
      images: [
        socialImage({
          title: post.title,
          subtitle: post.description,
          kind: "blog",
        }),
      ],
    },
    keywords: post.tags,
  };
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = postBySlug(slug);
  if (!post) notFound();

  const related = relatedPosts(post);
  const headings = post.blocks
    .filter((block) => block.type === "h2")
    .map((block) => (block.type === "h2" ? block : null))
    .filter((block): block is { type: "h2"; text: string; id?: string } => block !== null);

  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { "@type": "Organization", name: "Formivo", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Formivo", url: SITE_URL },
    mainEntityOfPage: canonicalUrl(`/blog/${post.slug}`),
    keywords: post.tags.join(", "),
    articleSection: post.category,
    inLanguage: "en",
  };

  return (
    <div className="flex flex-col">
      <Breadcrumbs
        items={[
          { href: "/blog", label: "Blog" },
          { href: `/blog/${post.slug}`, label: post.title },
        ]}
      />

      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start lg:gap-14">
        <article className="flex max-w-3xl min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{post.category}</Badge>
            <span className="text-xs text-foreground-muted">
              {formatDate(post.publishedAt)} · {post.readingMinutes} min read
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 border-y border-border py-3">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full bg-accent-subtle text-sm font-semibold text-accent-hover"
            >
              F
            </span>
            <div className="flex flex-col text-[12.5px] leading-snug">
              <span className="font-medium text-foreground">Written by the Formivo team</span>
              <span className="text-foreground-muted">
                Checked against the live product
                {post.updatedAt ? ` · Updated ${formatDate(post.updatedAt)}` : null}
              </span>
            </div>
          </div>

          <p className="rounded-xl border border-accent/25 bg-accent-subtle/50 px-4 py-3 text-[15px] leading-7 text-foreground">
            <span className="font-semibold">Short answer: </span>
            {post.answer}
          </p>

          <ContentBlocks blocks={post.blocks} />

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-foreground-muted"
              >
                #{tag}
              </span>
            ))}
          </div>

          <aside className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
            <p className="text-sm font-semibold text-foreground">Try it with your own form</p>
            <p className="text-sm leading-6 text-foreground-secondary">
              Create a form, copy the endpoint and point any HTML form at it. 300 submissions a
              month on the free plan, no card required.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Create a free account
              </Link>
              <Link
                href="/docs#endpoint"
                className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                Endpoint reference
              </Link>
            </div>
          </aside>

          {related.length > 0 ? (
            <section className="flex flex-col gap-4 pt-2">
              <h2 className="text-lg font-semibold text-foreground">Keep reading</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/blog/${item.slug}`}
                      className="flex h-full flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
                    >
                      <span className="text-xs text-foreground-muted">{item.category}</span>
                      <span className="text-sm font-medium text-foreground">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Link
            href="/blog"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            All articles
          </Link>

          <script
            type="application/ld+json"

            dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
          />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
              On this page
            </p>
            <nav aria-label="Table of contents">
              <ul className="flex flex-col gap-2 text-sm">
                {headings.map((heading) => (
                  <li key={heading.text}>
                    <a
                      href={`#${heading.id ?? headingId(heading.text)}`}
                      className="text-foreground-secondary hover:text-foreground"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/pricing"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              See plans <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </Container>
    </div>
  );
}
