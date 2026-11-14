import { ArrowRight, Check, Eye, Lock, Search, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { JsonLd } from "@/components/marketing/structured-data";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { canonicalUrl, socialImage } from "@/lib/seo";

const title = "Client Portal: Read-Only Access to Website Leads | Formivo";
const description =
  "Give a client a read-only view of their own form submissions without sharing your workspace. Access is per form, revocable, and enforced with row-level security.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/client-portal" },
  openGraph: {
    title,
    description,
    url: canonicalUrl("/client-portal"),
    images: [
      socialImage({
        title: "Your clients see their leads. You stay in control.",
        subtitle:
          "Read-only access per form, revocable at any time, enforced in the database as well as the app.",
      }),
    ],
  },
  twitter: { card: "summary_large_image", title, description },
};

const rows = [
  { name: "Amelia Hart", email: "amelia@northwind.co", status: "New", when: "Today, 09:41" },
  { name: "Daniel Osei", email: "d.osei@brightlane.io", status: "Contacted", when: "Yesterday" },
  { name: "Priya Raman", email: "priya@vertex.studio", status: "Qualified", when: "2 days ago" },
];

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Client portal",
          description,
          url: canonicalUrl("/client-portal"),
        }}
      />
      <Breadcrumbs items={[{ href: "/client-portal", label: "Client portal" }]} />

      <Container className="flex flex-col gap-14 py-12 lg:py-16">
        <PageHeader
          eyebrow="Client portal"
          title="Your clients see their leads. You stay in control."
          description="The client portal is a read-only account for one form. It removes the forwarded email and the shared login, without giving away your workspace."
        />

        <section aria-labelledby="preview-heading" className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-3">
            <h2 id="preview-heading" className="text-xl font-semibold tracking-tight text-foreground">
              What a client actually sees
            </h2>
            <p className="text-sm leading-6 text-foreground-secondary">
              The form name they were invited to, its submissions, and a search box. No workspace
              switcher, no settings, no billing, no other client&apos;s form. Statuses are visible so
              the client knows what has been handled.
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {[
                "Read-only: a client cannot edit a submission or change a form",
                "Scoped to the forms they were invited to, one permission per form",
                "Revoking the permission ends access on the next request",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground-secondary">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div aria-hidden="true" className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-45px_rgb(11_31_28/0.5)]">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/50 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-brand-ink font-mono text-[9px] font-semibold text-brand-mint">
                  AH
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[11.5px] font-medium text-foreground">Northwind contact form</span>
                  <span className="text-[10px] text-foreground-muted">Shared by Studio Faizyab</span>
                </div>
              </div>
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[9.5px] text-foreground-muted">
                Read only
              </span>
            </div>
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-[10.5px] text-foreground-muted">
              <Search className="size-3" />
              Search submissions
            </div>
            <ul className="divide-y divide-border">
              {rows.map((row) => (
                <li key={row.email} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-medium text-foreground">{row.name}</p>
                    <p className="truncate text-[10px] text-foreground-muted">{row.email}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[9.5px] text-foreground-secondary">
                      {row.status}
                    </span>
                    <span className="text-[9.5px] text-foreground-muted">{row.when}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-1.5 border-t border-border px-4 py-2 text-[9.5px] text-foreground-muted">
              <Lock className="size-2.5" />
              This account cannot open another form or change settings.
            </div>
          </div>
        </section>

        <section aria-labelledby="isolation-heading" className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Eye,
              title: "Read-only by design",
              body: "A client account has no workspace. Its only capability is reading the submissions of forms an active permission names.",
            },
            {
              icon: ShieldCheck,
              title: "Isolation, not a filter",
              body: "Row-level security limits reads to the permission's form. A modified identifier in a URL returns nothing, not someone else's data.",
            },
            {
              icon: Lock,
              title: "Revocable, immediately",
              body: "Permissions are checked on every request. Revoking one takes effect on the next read rather than at the next login.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                <p className="text-sm leading-6 text-foreground-secondary">{item.body}</p>
              </div>
            );
          })}
        </section>

        <section aria-labelledby="share-heading" className="grid gap-6 rounded-2xl border border-border bg-surface-muted/40 p-6 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-2">
            <h2 id="share-heading" className="text-lg font-semibold tracking-tight text-foreground">
              What stays with you
            </h2>
            <ul className="flex flex-col gap-1.5 text-sm text-foreground-secondary">
              <li>Workspace settings, billing and your other forms</li>
              <li>Lead status editing and form configuration</li>
              <li>The client permission list, including revocation</li>
              <li>Exports, which follow your plan and your permission to read</li>
            </ul>
          </div>
          <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm leading-6 text-foreground-secondary">
              White-label domains are not available today: the client opens the portal on the Formivo
              domain, scoped to their form. That limitation is stated on every plan rather than
              hidden.
            </p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/signup">Create a workspace</ButtonLink>
              <Link
                href="/docs/client-portal"
                className="inline-flex items-center gap-1 self-center text-sm font-medium text-accent hover:underline"
              >
                Read the client access docs
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}
