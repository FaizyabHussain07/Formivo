import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/guides", label: "Integrations" },
      { href: "/security", label: "Security" },
      { href: "/alternatives", label: "Alternatives" },
    ],
  },
  {
    title: "Developers",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs/api#endpoint", label: "API reference" },
      { href: "/guides/html", label: "HTML integration" },
      { href: "/guides/react", label: "React integration" },
      { href: "/guides/nextjs", label: "Next.js integration" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/blog/category/integration", label: "Tutorials" },
      { href: "/pricing#faq", label: "Pricing FAQ" },
      { href: "/llms.txt", label: "llms.txt" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="flex flex-col gap-10 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
              <Image
                src="/formivo-logo.png"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                className="size-6 shrink-0"
              />
              {siteConfig.name}
            </span>
            <p className="max-w-xs text-sm text-foreground-secondary">
              The form backend for developers who ship for clients. One public endpoint, a clean
              dashboard, and leads your clients can actually read.
            </p>
            <a
              className="w-fit text-sm text-foreground-muted hover:text-foreground"
              href={`mailto:${siteConfig.contactEmail}`}
            >
              {siteConfig.contactEmail}
            </a>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                {column.title}
              </p>
              <ul className="flex flex-col gap-2 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
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

        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-foreground-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {siteConfig.name}. All rights reserved.</p>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <p>Built for developers · No API keys, ever.</p>
            <span aria-hidden="true" className="hidden text-border-strong sm:inline">
              ·
            </span>
            <p>
              Made by{" "}
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
