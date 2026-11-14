import { ArrowRight, BookOpen, Code2, Compass, FileText, Newspaper, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { AiDiscovery } from "@/components/marketing/ai-discovery";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { canonicalUrl } from "@/lib/seo";

const title = "Formivo Resources: Docs, Guides, Comparisons and Press";
const description =
  "Everything for evaluating Formivo: documentation, integration guides, workflow comparisons, alternatives, articles and press information with reusable product facts.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/resources" },
  openGraph: { title, description, url: canonicalUrl("/resources") },
};

const groups = [
  {
    icon: BookOpen,
    title: "Documentation",
    body: "Endpoint contract, integration patterns, spam controls, client access and troubleshooting.",
    links: [
      { href: "/docs", label: "Documentation home" },
      { href: "/docs/quickstart", label: "Quickstart" },
      { href: "/docs/api", label: "API reference" },
      { href: "/docs/client-portal", label: "Client access" },
    ],
  },
  {
    icon: Code2,
    title: "Integration guides",
    body: "Working examples for the stacks Formivo is tested with, plus an index of every documented framework.",
    links: [
      { href: "/integrations", label: "All integrations" },
      { href: "/integrations/html", label: "HTML forms" },
      { href: "/integrations/react", label: "React" },
      { href: "/integrations/nextjs", label: "Next.js" },
      { href: "/guides", label: "Framework guides" },
    ],
  },
  {
    icon: FileText,
    title: "Articles",
    body: "Longer explanations of the workflow after a submission, written for developers and agencies.",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/blog/what-is-a-form-backend", label: "What is a form backend?" },
      { href: "/blog/form-backend-vs-custom-backend", label: "Form backend vs custom backend" },
      { href: "/blog/share-form-submissions-with-clients", label: "Sharing submissions with clients" },
    ],
  },
  {
    icon: Scale,
    title: "Comparisons and alternatives",
    body: "Where Formivo fits against form backends, email forwarding and form builders, with links to each provider's own site.",
    links: [
      { href: "/compare", label: "All comparisons" },
      { href: "/compare/formivo-vs-formspree", label: "vs Formspree" },
      { href: "/alternatives", label: "Alternatives" },
      { href: "/alternatives/form-backend-alternatives", label: "Form backend alternatives" },
    ],
  },
];

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/resources", label: "Resources" }]} />
      <Container className="flex flex-col gap-10 py-12 lg:py-16">
        <PageHeader
          eyebrow="Resources"
          title="Read enough to decide."
          description="The product is small on purpose, so the reading is short. Start with the quickstart if you want to test it, or with a comparison if you are choosing between tools."
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <li
                key={group.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-base font-semibold text-foreground">{group.title}</h2>
                <p className="text-sm leading-6 text-foreground-secondary">{group.body}</p>
                <ul className="mt-1 flex flex-col gap-1.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                      >
                        {link.label}
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <section
          aria-labelledby="press-heading"
          className="grid gap-6 rounded-2xl border border-border bg-surface-muted/40 p-6 lg:grid-cols-2"
        >
          <div className="flex flex-col gap-2">
            <h2 id="press-heading" className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Newspaper className="size-4 text-accent" aria-hidden="true" />
              Writing about Formivo?
            </h2>
            <p className="text-sm leading-6 text-foreground-secondary">
              The press page has a description you can quote, the canonical links and the facts that
              are safe to state. Nothing there is a rating or a customer count.
            </p>
            <Link
              href="/press"
              className="inline-flex w-fit items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Open the press page
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Compass className="size-4 text-accent" aria-hidden="true" />
              Ask an assistant
            </h3>
            <p className="text-xs leading-5 text-foreground-secondary">
              These open an assistant with a prompt that points at the official site. They are a
              shortcut for research, not a ranking claim.
            </p>
            <AiDiscovery compact />
          </div>
        </section>

        <p className="text-xs leading-5 text-foreground-muted">
          The machine-readable summary lives at{" "}
          <Link href="/llms.txt" className="underline">
            /llms.txt
          </Link>{" "}
          and{" "}
          <Link href="/llms-full.txt" className="underline">
            /llms-full.txt
          </Link>
          . It is generated from the same content as these pages, but no assistant is guaranteed to
          read it.
        </p>
      </Container>
    </>
  );
}
