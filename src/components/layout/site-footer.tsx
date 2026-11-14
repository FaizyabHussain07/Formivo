import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";

import { AiDiscovery } from "@/components/marketing/ai-discovery";
import { FeaturedBadgesMarquee } from "@/components/marketing/featured-badges-marquee";
import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

/**
 * Footer navigation. Every link points at a real public page: a href that 404s is a
 * worse signal than a missing column, so planned pages are not listed ahead of time.
 */
const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/client-portal", label: "Client portal" },
      { href: "/security", label: "Security" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/solutions/freelancers", label: "For freelancers" },
      { href: "/solutions/web-developers", label: "For web developers" },
      { href: "/solutions/web-agencies", label: "For web agencies" },
      { href: "/solutions/client-projects", label: "For client projects" },
      { href: "/solutions", label: "All solutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/quickstart", label: "Getting started" },
      { href: "/integrations", label: "Integration guides" },
      { href: "/blog", label: "Blog" },
      { href: "/compare", label: "Comparisons" },
      { href: "/alternatives", label: "Alternatives" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/press", label: "Press" },
      { href: "/featured-on", label: "Featured on" },
      { href: "/resources", label: "Resources" },
      { href: "/llms.txt", label: "llms.txt" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/security", label: "Security policy" },
    ],
  },
];

/**
 * The current year is a cached value rather than a synchronous read during
 * prerendering, which Cache Components rejects. It refreshes on the cache
 * lifetime, so the footer never needs a hand-maintained copyright year.
 */
async function copyrightYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await copyrightYear();

  return (
    <footer className="border-t border-border bg-surface">
      <FeaturedBadgesMarquee />
      <Container className="flex flex-col gap-10 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(5,1fr)]">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
              <Image
                src="/formivo-logo.png"
                alt=""
                aria-hidden="true"
                width={26}
                height={26}
                className="size-6 shrink-0"
              />
              {siteConfig.name}
            </span>
            <p className="max-w-xs text-sm leading-6 text-foreground-secondary">
              The form backend and lead workspace built for client projects. Forms to leads. Leads to
              clients.
            </p>
            <a
              className="w-fit text-sm text-foreground-muted transition-colors hover:text-foreground"
              href={`mailto:${siteConfig.contactEmail}`}
            >
              {siteConfig.contactEmail}
            </a>
            <p className="max-w-xs text-xs leading-5 text-foreground-muted">
              Built for developers and agencies.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                {column.title}
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                {column.links.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-foreground-secondary transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-muted/40 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-sm font-medium text-foreground">Ask AI about Formivo</p>
            <p className="mt-1 text-xs leading-5 text-foreground-secondary">
              Open an assistant with a factual prompt that points at the official site. Useful for
              research and sharing. It does not guarantee any ranking or that a model has read this
              page.
            </p>
          </div>
          <AiDiscovery compact />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p>Forms to leads. Leads to clients.</p>
            <span aria-hidden="true" className="hidden text-border-strong sm:inline">
              ·
            </span>
            <p>
              Built by{" "}
              <a
                href="http://faizyab.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground-secondary underline-offset-2 transition-colors hover:text-foreground hover:underline"
              >
                Faizyab Hussain
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
