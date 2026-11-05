import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { guides } from "@/content/guides";

export const metadata: Metadata = {
  title: { absolute: "Integration Guides | Post Any Form to Formivo" },
  description:
    "Copy-paste integration guides for HTML, JavaScript, React, Next.js, Vue, Nuxt, PHP, Laravel, Node, Express, Python, Django, Flask and static sites.",
  alternates: { canonical: "/guides" },
  keywords: ["form backend tutorial","html form to backend","react form backend","php form backend"],
  openGraph: {
    title: "Integration guides for every stack",
    description: "Copy-paste guides for HTML, JavaScript, React, Next.js, Vue, Nuxt, PHP, Laravel, Node, Python and static sites.",
    images: [socialImage({ title: "Integration guides for every stack", subtitle: "Copy-paste guides for HTML, JavaScript, React, Next.js, Vue, Nuxt, PHP, Laravel, Node, Python and static sites.", kind: "guide" })],
  },
  twitter: {
    card: "summary_large_image",
    title: "Integration guides for every stack",
    description: "Copy-paste guides for HTML, JavaScript, React, Next.js, Vue, Nuxt, PHP, Laravel, Node, Python and static sites.",
    images: [socialImage({ title: "Integration guides for every stack", subtitle: "Copy-paste guides for HTML, JavaScript, React, Next.js, Vue, Nuxt, PHP, Laravel, Node, Python and static sites." })],
  },
};

export default function GuidesPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <Container className="flex flex-col gap-4 py-14">
          <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
            Guides
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            One endpoint. Every stack you actually use.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            Each guide is a complete, working example against the same public endpoint — no
            framework-specific SDK, no key, no build step.
          </p>
        </Container>
      </section>

      <Container className="py-12">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${guide.slug}`}
                className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <span className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                  {guide.language}
                </span>
                <span className="text-base font-semibold text-foreground">{guide.title}</span>
                <span className="text-sm leading-6 text-foreground-secondary">{guide.summary}</span>
                <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-accent">
                  Open guide <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
