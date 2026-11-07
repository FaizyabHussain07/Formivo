import { ArrowRight, Check, Database, Globe, KeyRound, Layers } from "lucide-react";
import Link from "next/link";

import { TrackView } from "@/components/analytics/track-view";
import { DocPageLayout, DocProse, DocSection } from "@/components/docs/doc-page";
import { ButtonLink } from "@/components/ui/button";
import { DOCS_NAV } from "@/config/docs";
import { siteConfig } from "@/config/site";
import { docMetadata } from "@/lib/docs/metadata";

export const metadata = docMetadata({
  title: "Introduction",
  description:
    "Formivo is a form backend: one public endpoint per form, submissions stored server-side, and a dashboard where leads are read and shared with clients.",
  path: "/docs",
});

const endpoint = `${siteConfig.productionUrl}/api/f/{formId}`;

const concepts = [
  {
    icon: Globe,
    title: "One endpoint per form",
    body: "Every form you create gets a permanent HTTPS endpoint. Point an existing <form> at it, or POST JSON from any language.",
  },
  {
    icon: KeyRound,
    title: "No key on the client",
    body: "Public submissions are accepted without a secret, because a secret shipped in a browser is not a secret. Access control lives on reads.",
  },
  {
    icon: Database,
    title: "Submissions stay yours",
    body: "Rows are written server-side with workspace ownership set by the server, never by the request payload.",
  },
  {
    icon: Layers,
    title: "Share without sharing",
    body: "A client viewer sees only the forms you granted, read-only, and you can revoke access at any time.",
  },
];

export default function Page() {
  return (
    <DocPageLayout
      href="/docs"
      title="Documentation"
      badge="API v1"
      description="Formivo gives every form one public submission endpoint and a dashboard to read the results. This reference covers the endpoint contract, integrations, and the product rules behind plan limits and client access."
    >
      <TrackView event="docs_viewed" properties={{ page: "introduction" }} />

      <DocSection id="what-formivo-is" title="What Formivo is">
        <DocProse>
          <p>
            Formivo is a form backend. It replaces the server code that would otherwise receive a
            contact form, validate it, store it, and mail it to someone. You keep your own form
            markup and styling; Formivo owns the receiving, storage and dashboard.
          </p>
          <p>
            A request arrives at{" "}
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-[12px]">
              POST {endpoint}
            </code>
            . The server validates the payload, applies the form&apos;s rules, counts the submission
            against the workspace plan, stores it, and returns a predictable response.
          </p>
        </DocProse>
      </DocSection>

      <DocSection id="concepts" title="Core concepts">
        <div className="grid gap-3 sm:grid-cols-2">
          {concepts.map((concept) => (
            <div
              key={concept.title}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
            >
              <concept.icon aria-hidden="true" className="size-4 text-accent" />
              <p className="text-sm font-medium text-foreground">{concept.title}</p>
              <p className="text-xs leading-relaxed text-foreground-secondary">{concept.body}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="request-lifecycle" title="Request lifecycle">
        <DocProse>
          <p>Every submission follows the same path, and each step can reject the request:</p>
        </DocProse>
        <ol className="flex flex-col gap-3">
          {[
            ["Resolve the form", "The form id is looked up and must exist and accept submissions."],
            [
              "Validate the body",
              "Content type, size, field count, depth and field types are checked.",
            ],
            ["Apply protections", "Honeypot, allowed-domain rules and rate limits are evaluated."],
            ["Enforce quota", "The plan's monthly submission allowance is reserved atomically."],
            [
              "Store and respond",
              "The submission is written, then a JSON body or a thank-you page is returned.",
            ],
          ].map(([title, body], index) => (
            <li key={title} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle font-mono text-xs font-semibold text-accent">
                {index + 1}
              </span>
              <span className="text-sm text-foreground-secondary">
                <strong className="text-foreground">{title}.</strong> {body}
              </span>
            </li>
          ))}
        </ol>
      </DocSection>

      <DocSection id="whats-inside" title="What is in these docs">
        <div className="grid gap-3 sm:grid-cols-2">
          {DOCS_NAV.flatMap((group) => group.pages)
            .filter((page) => page.href !== "/docs")
            .map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground group-hover:text-accent">
                  {page.title}
                  <ArrowRight
                    aria-hidden="true"
                    className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </span>
                <span className="text-xs leading-relaxed text-foreground-secondary">
                  {page.description}
                </span>
              </Link>
            ))}
        </div>
      </DocSection>

      <DocSection id="guarantees" title="What Formivo does not do">
        <ul className="flex flex-col gap-2 text-sm text-foreground-secondary">
          {[
            "It does not authenticate your form submissions. Anyone with the endpoint can post to it; protections raise the cost of abuse, they do not replace your own business rules.",
            "It does not store files. Bodies are JSON, form-encoded or multipart without file parts.",
            "It does not email every submission by default; notification email is configured per form.",
            "It does not read your site's data. The endpoint receives only what you send it.",
          ].map((item) => (
            <li key={item} className="flex gap-2.5">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </DocSection>

      <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-surface p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Start with a real endpoint</p>
          <p className="text-xs text-foreground-secondary">
            The quickstart takes about two minutes and produces a working form.
          </p>
        </div>
        <ButtonLink href="/docs/quickstart" size="sm">
          Read the quickstart
          <ArrowRight aria-hidden="true" />
        </ButtonLink>
      </div>
    </DocPageLayout>
  );
}
