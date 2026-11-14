import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Security | How Formivo Protects Form Submissions" },
  description:
    "The concrete controls behind Formivo: unauthenticated write-only endpoints, validation and rate limits, row-level security, client isolation and revocable access.",
  alternates: { canonical: "/security" },
  keywords: [
    "form backend security",
    "secure form endpoint",
    "spam protection form",
    "form data privacy",
  ],
  openGraph: {
    title: "How Formivo protects form submissions",
    description:
      "Write-only endpoints, validation, rate limits, row-level security and revocable client access, explained without marketing fog.",
    images: [
      socialImage({
        title: "How Formivo protects form submissions",
        subtitle:
          "Write-only endpoints, validation, rate limits, row-level security and revocable client access, explained without marketing fog.",
        kind: "product",
      }),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Formivo protects form submissions",
    description:
      "Write-only endpoints, validation, rate limits, row-level security and revocable client access, explained without marketing fog.",
    images: [
      socialImage({
        title: "How Formivo protects form submissions",
        subtitle:
          "Write-only endpoints, validation, rate limits, row-level security and revocable client access, explained without marketing fog.",
      }),
    ],
  },
};

const sections = [
  {
    title: "The public endpoint is write-only",
    body: [
      "Anyone can POST to a form endpoint. That is the product. What they cannot do is read. The endpoint never exposes a listing, a submission body or an id belonging to someone else; retries return only the submission the caller just created.",
      "Because a form id in public HTML is not a credential, protection comes from what can be enforced server-side: structural validation, rate limits stored in the database, per-form quota checks inside the insert transaction, and optional browser-origin allow-lists.",
    ],
  },
  {
    title: "Reads are authorized per request",
    body: [
      "A submission can only be read by a signed-in workspace member, or by a client holding an active permission for that specific form. The check derives ownership from the signed-in session and the ownership chain, never from a form id, submission id or workspace id supplied in a query string.",
      "Client permissions are checked on every request, so revoking access takes effect immediately. There is no cached session to expire.",
    ],
  },
  {
    title: "The database enforces the same rules",
    body: [
      "Row Level Security is enabled on every application table. Policies scope forms to their owning workspace, submissions to forms the caller can view, and leave roles, billing, usage and audit tables writable only by trusted server logic.",
      "Roles live in a separate table with no write policy, so a profile update can never promote an account to developer.",
    ],
  },
  {
    title: "Client isolation is tested, not assumed",
    body: [
      "The test suite creates two clients, two workspaces and submissions in each, then attempts cross-access with modified identifiers. Access is rejected, and revocation is verified to close the door on the next query.",
    ],
  },
  {
    title: "Secrets stay server-side",
    body: [
      "The Supabase service role, the email provider key and the billing API key are read through server-only modules. Error messages name a missing variable, never its value. Webhook signatures are verified with a timing-safe comparison and replayed events are rejected by provider event id.",
    ],
  },
  {
    title: "Headers and transport",
    body: [
      "Responses carry a Content-Security-Policy, HSTS, X-Frame-Options, a referrer policy, Permissions-Policy, COOP and nosniff. Authenticated areas are explicitly marked private and non-cacheable so a shared cache can never store a dashboard page.",
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <Container className="flex flex-col gap-4 py-14">
          <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
            Security
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            What actually protects a public form endpoint.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            No certifications to display and no “bank-grade” claims. This page lists the controls
            that exist in the product, so you can decide whether they meet your bar.
          </p>
        </Container>
      </section>

      <Container className="flex max-w-3xl flex-col gap-8 py-12">
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {section.title}
            </h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-[15px] leading-7 text-foreground-secondary">
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">Reporting a vulnerability</h2>
          <p className="text-sm leading-6 text-foreground-secondary">
            Email{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-accent hover:underline">
              {siteConfig.contactEmail}
            </a>{" "}
            with steps to reproduce. Please do not test against other customers&apos; data; use your
            own workspace. We will confirm receipt and tell you what we fixed.
          </p>
          <p className="text-sm leading-6 text-foreground-secondary">
            The full endpoint contract is in the{" "}
            <Link href="/docs/spam-protection" className="text-accent hover:underline">
              documentation
            </Link>
            .
          </p>
        </section>
      </Container>
    </div>
  );
}
