import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/marketing/reveal";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";

/**
 * Only stacks with a real integration guide or documented pattern are listed.
 * The endpoint accepts any HTTP client, which is stated plainly rather than
 * padded with logos we cannot support.
 */
const technologies = [
  { name: "HTML", href: "/guides/html" },
  { name: "React", href: "/guides/react" },
  { name: "Next.js", href: "/guides/nextjs" },
  { name: "Vue", href: "/guides/vue" },
  { name: "Nuxt", href: "/guides/nuxt" },
  { name: "JavaScript", href: "/guides/javascript" },
  { name: "PHP", href: "/guides/php" },
  { name: "Laravel", href: "/guides/laravel" },
  { name: "Node.js", href: "/guides/node" },
  { name: "Express", href: "/guides/express" },
  { name: "Python", href: "/guides/python" },
  { name: "Django", href: "/guides/django" },
  { name: "Flask", href: "/guides/flask" },
  { name: "Static sites", href: "/guides/static" },
];

export function TechnologyStrip() {
  return (
    <section aria-labelledby="compatibility-heading" className="border-b border-border">
      <Container className="flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading
          eyebrow="Works with your stack"
          title="Works with the websites you already build."
          description="Keep your existing frontend. Connect your forms to Formivo."
          titleClassName="max-w-xl"
          actions={
            <Link
              href="/guides"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Browse integration guides
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />

        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {technologies.map((technology, index) => (
            <li key={technology.name}>
              <Reveal delay={index * 25} className="h-full">
                <Link
                  href={technology.href}
                  className="group flex h-full flex-col justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 transition-colors hover:border-border-strong hover:bg-surface-muted/40"
                >
                  <span className="font-mono text-[9px] text-foreground-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium tracking-tight text-foreground">
                      {technology.name}
                    </span>
                    <ArrowUpRight
                      className="size-3 shrink-0 text-foreground-muted opacity-0 transition-opacity group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        <p className="text-[13px] text-foreground-muted">
          Not on the list? If it can send an HTTP POST, it works.{" "}
          <Link
            href="/docs/api"
            className="font-medium text-foreground-secondary underline-offset-2 hover:text-foreground hover:underline"
          >
            Read the endpoint contract
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
