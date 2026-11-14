import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { integrations } from "@/content/integrations";

const title = "Form integration guides: HTML, JavaScript, React and Next.js";
const description =
  "Connect an existing form to Formivo in a few lines. Guides for plain HTML, JavaScript, React and Next.js, each with a working example and the exact endpoint behavior.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/integrations" },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs items={[{ href: "/integrations", label: "Integrations" }]} />
      <Container className="flex flex-col gap-10 py-12 lg:py-16">
        <PageHeader
          eyebrow="Integrations"
          title="If it can send a POST, it works with Formivo."
          description="Formivo does not need an SDK. These guides cover the stacks that are documented and tested. Framework-specific guides for Vue, Svelte, PHP, Laravel, Node and Python live in the documentation as well."
        />

        <ul className="grid gap-4 sm:grid-cols-2">
          {integrations.map((integration) => (
            <li
              key={integration.slug}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6"
            >
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                <Link href={`/integrations/${integration.slug}`} className="hover:text-accent">
                  {integration.name}
                </Link>
              </h2>
              <p className="text-sm leading-6 text-foreground-secondary">{integration.answer}</p>
              <Link
                href={`/integrations/${integration.slug}`}
                className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-accent hover:underline"
              >
                Open the guide
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted/40 p-6">
          <h2 className="text-base font-semibold text-foreground">Not listed?</h2>
          <p className="text-sm text-foreground-secondary">
            Any language that can make an HTTP request can use the endpoint. Read the{" "}
            <Link href="/docs/api" className="text-accent hover:underline">
              API reference
            </Link>{" "}
            for the body formats, reserved fields and status codes.
          </p>
        </div>
      </Container>
    </>
  );
}
