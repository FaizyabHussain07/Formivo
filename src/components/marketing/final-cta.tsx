import { ArrowRight } from "lucide-react";

import { SectionHeading } from "@/components/marketing/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

/** Closing section. Two CTAs, no newsletter: there is no mailing list backend. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="border-b border-border bg-surface">
      <Container className="py-20 sm:py-24">
        <div className="flex flex-col gap-8 rounded-2xl border border-border bg-surface-muted/40 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeading
            eyebrow="Get started"
            title="Stop managing form submissions manually."
            description="Bring your website forms, submissions and client access into one organized workspace. Free to start, no card required."
            titleClassName="max-w-xl"
          />
          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <ButtonLink href="/signup" size="lg">
              Start free
              <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/pricing" size="lg" variant="secondary">
              Explore pricing
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
