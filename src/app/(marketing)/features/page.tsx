import {
  ArrowRight,
  Code2,
  Download,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";
import Link from "next/link";

import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: { absolute: "Features | Formivo Form Backend" },
  description:
    "Every Formivo feature explained: public endpoints without keys, validated intake, lead statuses, CSV exports, client viewers, rate limits and plan enforcement.",
  alternates: { canonical: "/features" },
  keywords: ["form backend features","form endpoint features","client portal for forms","csv export submissions"],
  openGraph: {
    title: "Everything Formivo does after the submit button",
    description: "Validated intake, rate limits, searchable submissions, CSV export and scoped client access — the features behind the endpoint.",
    images: [socialImage({ title: "Everything Formivo does after the submit button", subtitle: "Validated intake, rate limits, searchable submissions, CSV export and scoped client access — the features behind the endpoint.", kind: "product" })],
  },
  twitter: {
    card: "summary_large_image",
    title: "Everything Formivo does after the submit button",
    description: "Validated intake, rate limits, searchable submissions, CSV export and scoped client access — the features behind the endpoint.",
    images: [socialImage({ title: "Everything Formivo does after the submit button", subtitle: "Validated intake, rate limits, searchable submissions, CSV export and scoped client access — the features behind the endpoint." })],
  },
};

const features = [
  {
    icon: Code2,
    title: "Public endpoint per form",
    body: "One POST URL that accepts JSON, urlencoded and multipart bodies. It works with plain HTML, any framework, curl or a webhook. There is no key to embed because a key in client markup is not a secret.",
    href: "/docs#endpoint",
    linkLabel: "Endpoint reference",
  },
  {
    icon: ShieldCheck,
    title: "Validated intake, not hopeful intake",
    body: "256 KB body cap, 100-field limit, depth and value limits, unsupported content types rejected, and structured error codes that never leak schema details.",
    href: "/blog/form-submission-security",
    linkLabel: "How validation works",
  },
  {
    icon: Gauge,
    title: "Rate limits that survive scaling",
    body: "Fixed windows stored in the database, applied per form, per IP and per form+IP. Parallel requests serialize before the limit is evaluated, so spikes cannot slip through.",
    href: "/blog/prevent-contact-form-spam",
    linkLabel: "Spam prevention",
  },
  {
    icon: LayoutDashboard,
    title: "A dashboard for the leads",
    body: "Every submission becomes a record with a status, a source and the raw fields. Search across name, email, message, subject and phone without exporting anything first.",
    href: "/signup",
    linkLabel: "Create an account",
  },
  {
    icon: Users,
    title: "Client viewers, not shared logins",
    body: "Invite a client to one form. They get a read-only account with no workspace and no billing, can be revoked per form, and never see your other projects.",
    href: "/blog/share-form-submissions-with-clients",
    linkLabel: "Client access explained",
  },
  {
    icon: Download,
    title: "CSV export on paid plans",
    body: "Exports respect the workspace plan and the form permission, are escaped for spreadsheets, and are gated on the server — hiding a button is not a control.",
    href: "/pricing",
    linkLabel: "See plans",
  },
  {
    icon: KeyRound,
    title: "Optional origin allow-lists",
    body: "Restrict a form to the sites that should use it. Documented honestly as a browser control, not authentication, and paired with rate limits for that reason.",
    href: "/docs#security",
    linkLabel: "Security model",
  },
  {
    icon: Mail,
    title: "Plans enforced at ingest",
    body: "Form count, viewer count and monthly submissions are checked in the same transaction that stores the data. The plan is a ceiling, not a suggestion.",
    href: "/pricing#plans",
    linkLabel: "Plan limits",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <Container className="flex flex-col gap-4 py-14">
          <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
            Features
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            A small product, finished properly.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            Formivo does one job: receive form submissions, keep them safe, and let the right people
            read them. Every feature below exists because that job breaks without it.
          </p>
        </Container>
      </section>

      <Container className="py-12">
        <ul className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface-muted text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-base font-semibold text-foreground">{feature.title}</h2>
                <p className="text-sm leading-6 text-foreground-secondary">{feature.body}</p>
                <Link
                  href={feature.href}
                  className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium text-accent hover:underline"
                >
                  {feature.linkLabel}
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
