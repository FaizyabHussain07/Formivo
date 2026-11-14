import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { cn } from "@/lib/utils/cn";

/**
 * Prices and limits come from the same plan configuration the application and
 * structure data use. Nothing here is typed by hand, so the marketing page cannot
 * drift away from what the product actually enforces.
 */
export function PricingPreview() {
  return (
    <section id="pricing" className="scroll-mt-20 border-b border-border bg-surface">
      <Container className="flex flex-col gap-10 py-20 sm:py-24">
        <SectionHeading
          eyebrow="Pricing"
          title="Start simple. Grow with your projects."
          description="Every plan includes the same public endpoints, validation and abuse protection. You pay for more forms, submissions and client viewers. Prices in USD, billed monthly."
          actions={
            <Link
              href="/pricing#compare"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Compare every limit
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />

        <ul className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLAN_ORDER.map((key) => {
            const plan = PLANS[key];
            const featured = key === "pro";

            return (
              <li
                key={plan.key}
                className={cn(
                  "relative flex h-full flex-col gap-5 rounded-2xl border bg-surface p-6",
                  featured
                    ? "border-accent/50 shadow-[0_24px_60px_-40px_rgb(15_118_110/0.5)]"
                    : "border-border",
                )}
              >
                {featured ? (
                  <span className="absolute -top-3 left-6">
                    <Badge tone="accent">Most popular</Badge>
                  </span>
                ) : null}

                <div className="flex flex-col gap-1">
                  <h3 className="text-[15px] font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-[12.5px] leading-5 text-foreground-secondary">
                    {plan.description}
                  </p>
                </div>

                <p className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-[-0.03em] text-foreground">
                    ${plan.priceMonthly}
                  </span>
                  <span className="text-[12px] text-foreground-muted">/ month</span>
                </p>

                <ul className="flex flex-1 flex-col gap-2.5">
                  {plan.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex gap-2 text-[13px] text-foreground-secondary">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2">
                  <ButtonLink
                    href={key === "free" ? "/signup" : "/pricing"}
                    variant={featured ? "primary" : "secondary"}
                  >
                    {key === "free" ? "Start free" : `View ${plan.name}`}
                    <ArrowRight aria-hidden="true" />
                  </ButtonLink>
                  <p className="text-center text-[10.5px] text-foreground-muted">
                    {key === "free"
                      ? "No card required."
                      : "Choose or change plans on the pricing page."}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="text-[11px] leading-5 text-foreground-muted">
          Monthly submission allowances reset on the subscription anniversary for paid plans, and on
          the 1st of each month in UTC on Free. Existing submissions are retained when a limit is
          reached.
        </p>
      </Container>
    </section>
  );
}
