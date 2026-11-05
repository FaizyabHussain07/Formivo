import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { blogCategories, postsInCategory } from "@/content/blog";

type Params = Promise<{ category: string }>;

function resolveCategory(slug: string) {
  return blogCategories.find((category) => category.toLowerCase() === slug.toLowerCase());
}

export function generateStaticParams() {
  return blogCategories.map((category) => ({ category: category.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  const resolved = resolveCategory(category);
  if (!resolved) return { title: "Category not found" };

  return {
    title: { absolute: `${resolved} articles | Formivo Blog` },
    description: `Articles about ${resolved.toLowerCase()} on the Formivo blog: form backends, integrations, submission security and client workflows.`,
    alternates: { canonical: `/blog/category/${resolved.toLowerCase()}` },
  };
}

export default async function BlogCategoryPage({ params }: { params: Params }) {
  const { category } = await params;
  const resolved = resolveCategory(category);
  if (!resolved) notFound();

  const posts = postsInCategory(resolved);

  return (
    <div className="flex flex-col">
      <Breadcrumbs
        items={[
          { href: "/blog", label: "Blog" },
          { href: `/blog/category/${resolved.toLowerCase()}`, label: resolved },
        ]}
      />

      <Container className="flex flex-col gap-8 py-12">
        <header className="flex flex-col gap-3">
          <Badge tone="accent">{resolved}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {resolved} articles
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            {posts.length} article{posts.length === 1 ? "" : "s"} in this category.{" "}
            <Link href="/blog" className="text-accent hover:underline">
              Browse everything
            </Link>
            .
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-5">
                <span className="text-xs text-foreground-muted">
                  {post.publishedAt} · {post.readingMinutes} min
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm leading-6 text-foreground-secondary">{post.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
