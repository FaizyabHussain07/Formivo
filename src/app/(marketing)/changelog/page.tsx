import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { changelog } from "@/content/changelog";
import { canonicalUrl } from "@/lib/seo";

const title = "Formivo Changelog: What Shipped and When";
const description =
  "Every change to Formivo, described as shipped: billing on Paddle, the four plans, email verification, client access, submission management and the public endpoint.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/changelog" },
  openGraph: { title, description, url: canonicalUrl("/changelog") },
};

const TAG_LABEL: Record<string, string> = {
  product: "Product",
  billing: "Billing",
  security: "Security",
  platform: "Platform",
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/changelog", label: "Changelog" }]} />
      <Container className="flex max-w-3xl flex-col gap-10 py-12 lg:py-16">
        <PageHeader
          eyebrow="Changelog"
          title="What shipped, newest first."
          description="Only completed work appears here. If something is planned, it is not on this page."
        />

        <ol className="flex flex-col gap-8">
          {changelog.map((entry) => (
            <li key={`${entry.date}-${entry.title}`} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <time dateTime={entry.date} className="font-mono text-[11px] text-foreground-muted">
                  {entry.date}
                </time>
                <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] tracking-wide text-foreground-secondary uppercase">
                  {TAG_LABEL[entry.tag] ?? entry.tag}
                </span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{entry.title}</h2>
              <p className="text-sm leading-6 text-foreground-secondary">{entry.summary}</p>
              <ul className="flex flex-col gap-1.5 pl-5 text-sm text-foreground-secondary [&>li]:list-disc">
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="border-t border-border pt-6 text-sm text-foreground-secondary">
          For endpoint-level details, see the{" "}
          <Link href="/docs/changelog" className="text-accent hover:underline">
            documentation changelog
          </Link>
          . Product questions go to{" "}
          <Link href="/contact" className="text-accent hover:underline">
            contact
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
