import { ArrowRight, BookOpen, LifeBuoy, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "Contact Formivo | Product and Support Questions" },
  description:
    "Contact the Formivo team with product questions, support requests, or feedback about form submission management.",
  alternates: { canonical: "/contact" },
};

const channels = [
  {
    icon: LifeBuoy,
    title: "Product support",
    description: "Something not working, or a submission behaving unexpectedly?",
    action: `mailto:${siteConfig.contactEmail}?subject=Support%20request`,
    actionLabel: "Email support",
  },
  {
    icon: Users,
    title: "Plans & agencies",
    description: "Higher volume, many client workspaces, or a custom arrangement.",
    action: `mailto:${siteConfig.contactEmail}?subject=Plans%20and%20agencies`,
    actionLabel: "Talk to us",
  },
  {
    icon: ShieldCheck,
    title: "Security",
    description: "Report a vulnerability or ask about our data handling practices.",
    action: `mailto:${siteConfig.contactEmail}?subject=Security`,
    actionLabel: "Contact security",
  },
];

export default function Page() {
  return (
    <Container className="flex flex-col gap-10 py-12 sm:py-16">
      <PageHeader
        eyebrow="Contact"
        title="We are a small team, and we answer."
        description="Email is the fastest way to reach us. Most messages get a reply within one business day."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {channels.map(({ icon: Icon, title, description, action, actionLabel }) => (
          <section
            key={title}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(11_31_28/0.04)]"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-accent/20 bg-accent-subtle text-accent">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-foreground-secondary">{description}</p>
            <a
              href={action}
              className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-accent hover:underline"
            >
              {actionLabel} <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </section>
        ))}
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-semibold text-foreground">Prefer to read first?</p>
          <p className="text-sm text-foreground-secondary">
            The docs cover the endpoint contract, error codes, rate limits and the security model —
            often faster than waiting for a reply.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/docs" variant="secondary">
            <BookOpen aria-hidden="true" />
            Read the docs
          </ButtonLink>
          <ButtonLink href="/signup">
            Get started
            <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </div>
      </div>

      <p className="text-sm text-foreground-secondary">
        You can also email us directly at{" "}
        <Link
          href={`mailto:${siteConfig.contactEmail}`}
          className="font-medium text-accent hover:underline"
        >
          {siteConfig.contactEmail}
        </Link>
        . We do not run a public issue tracker; send reproduction steps and we will dig in.
      </p>
    </Container>
  );
}
