import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { blogCategories, sortedPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: { absolute: "Formivo Blog | Form Backends, Integrations and Client Workflows" },
  description:
    "Practical articles on form backends, HTML and JavaScript integrations, spam prevention, submission security and sharing leads with clients.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
  keywords: ["form backend blog","form submission tutorials","contact form backend guide"],
  openGraph: {
    title: "Notes on form backends and client work",
    description: "Practical writing on form backends, integrations, spam control and handing leads to clients without sharing logins.",
    images: [socialImage({ title: "Notes on form backends and client work", subtitle: "Practical writing on form backends, integrations, spam control and handing leads to clients without sharing logins.", kind: "blog" })],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notes on form backends and client work",
    description: "Practical writing on form backends, integrations, spam control and handing leads to clients without sharing logins.",
    images: [socialImage({ title: "Notes on form backends and client work", subtitle: "Practical writing on form backends, integrations, spam control and handing leads to clients without sharing logins." })],
  },
};

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BlogIndexPage() {
  const [featured, ...rest] = sortedPosts;

  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <Container className="flex flex-col gap-5 py-14 sm:py-16">
          <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
            Blog
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Notes on forms, submissions and shipping client work.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            Every article is written against the real endpoint documented in the{" "}
            <Link href="/docs" className="text-accent hover:underline">
              docs
            </Link>
            . No invented benchmarks, no vendor smackdowns.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {blogCategories.map((category) => (
              <Link
                key={category}
                href={`/blog/category/${category.toLowerCase()}`}
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground-secondary transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {category}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="flex flex-col gap-10 py-12">
        {featured ? (
          <article className="surface-ring flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent">Latest</Badge>
              <Badge>{featured.category}</Badge>
              <span className="text-xs text-foreground-muted">
                {formatDate(featured.publishedAt)} · {featured.readingMinutes} min read
              </span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-balance text-foreground sm:text-3xl">
              <Link href={`/blog/${featured.slug}`} className="hover:text-accent">
                {featured.title}
              </Link>
            </h2>
            <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
              {featured.description}
            </p>
            <Link
              href={`/blog/${featured.slug}`}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              Read the article <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </article>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          {rest.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <div className="flex items-center gap-2 text-xs text-foreground-muted">
                <Badge>{post.category}</Badge>
                <span>{formatDate(post.publishedAt)}</span>
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} min</span>
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm leading-6 text-foreground-secondary">{post.description}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-auto inline-flex w-fit items-center gap-1.5 pt-1 text-sm font-medium text-accent hover:underline"
              >
                Read <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <aside className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              Want the endpoint reference instead?
            </p>
            <p className="text-sm text-foreground-secondary">
              Status codes, limits, headers and the security model in one page.
            </p>
          </div>
          <Link
            href="/docs"
            className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Read the docs
          </Link>
        </aside>
      </Container>
    </div>
  );
}
