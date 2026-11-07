import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { docsPager } from "@/config/docs";

/** Section wrapper. Every section gets an id so the on-page table of contents can link to it. */
export function DocSection({
  id,
  title,
  children,
  eyebrow,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <section
      id={id}
      className="flex scroll-mt-24 flex-col gap-4 border-t border-border pt-8 first:border-t-0 first:pt-0"
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

/** Sub-heading inside a section; not included in the page-level table of contents. */
export function DocSubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="pt-2 text-sm font-semibold text-foreground">{children}</h3>;
}

export function DocProse({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-foreground-secondary">
      {children}
    </div>
  );
}

export function DocCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground">
      {children}
    </code>
  );
}

/** Uniform page shell: breadcrumb, title, lead paragraph, body and prev/next links. */
export function DocPageLayout({
  href,
  title,
  description,
  badge,
  children,
}: {
  href: string;
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  const { previous, next } = docsPager(href);

  return (
    <article className="flex min-w-0 flex-col gap-9">
      <header className="flex flex-col gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
          <Link
            href="/docs"
            className="text-foreground-muted transition-colors hover:text-foreground"
          >
            Documentation
          </Link>
          {href !== "/docs" ? (
            <>
              <span aria-hidden="true" className="text-foreground-muted">
                /
              </span>
              <span className="text-foreground-secondary">{title}</span>
            </>
          ) : null}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {badge ? (
            <span className="rounded-full border border-accent/30 bg-accent-subtle px-2.5 py-0.5 text-[11px] font-medium text-accent">
              {badge}
            </span>
          ) : null}
        </div>

        <p className="max-w-2xl text-base text-foreground-secondary">{description}</p>
      </header>

      <div data-doc-content className="flex flex-col gap-8">
        {children}
      </div>

      {previous || next ? (
        <nav
          aria-label="Documentation pagination"
          className="mt-2 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              href={previous.href}
              className="group flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/40"
            >
              <span className="flex items-center gap-1.5 text-[11px] tracking-wide text-foreground-muted uppercase">
                <ArrowLeft aria-hidden="true" className="size-3.5" />
                Previous
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-accent">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={next.href}
              className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-surface px-4 py-3 text-right transition-colors hover:border-accent/40 sm:col-start-2"
            >
              <span className="flex items-center gap-1.5 text-[11px] tracking-wide text-foreground-muted uppercase">
                Next
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
              <span className="text-sm font-medium text-foreground group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </article>
  );
}
