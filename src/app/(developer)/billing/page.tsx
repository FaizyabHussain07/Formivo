import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { openBillingPortalAction } from "@/app/(developer)/billing/actions";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, UsageBar } from "@/components/ui/stat-card";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getBillingConfig } from "@/lib/billing/lemonsqueezy";
import { PLANS, PLAN_ORDER, formatLimit } from "@/lib/billing/plans";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Billing" };

type SearchParams = Promise<{ checkout?: string; portal?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="text-sm text-foreground-muted">Loading billing…</p>}>
      <BillingContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BillingContent({ searchParams }: { searchParams: SearchParams }) {
  const developer = await requireDeveloper();
  const sp = await searchParams;
  const billing = getBillingConfig();
  const entitlements = developer.entitlements;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Billing"
        description="Plans, usage and subscription for this workspace."
      />

      {!billing.configured ? (
        <Alert tone="warning" title="Billing is not connected on this deployment">
          Checkout needs the Lemon Squeezy environment variables (
          <code className="font-mono text-xs">LEMONSQUEEZY_*</code>). The free plan works without
          billing; paid upgrades stay disabled until the provider is configured.
        </Alert>
      ) : null}

      {sp.checkout === "success" ? (
        <Alert tone="info" title="Checkout completed">
          Lemon Squeezy will confirm the subscription with a webhook. This page updates as soon as
          the verified event arrives — refresh in a moment.
        </Alert>
      ) : null}

      {sp.portal === "unavailable" ? (
        <Alert tone="warning" title="Subscription portal unavailable">
          No provider subscription is linked to this workspace yet, or the provider could not be
          reached. If you just subscribed, wait for the webhook and try again.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Current plan"
          value={entitlements.plan.name}
          hint={`Status: ${entitlements.subscriptionStatus.replace("_", " ")}`}
        />
        <StatCard
          label="Submissions this month"
          value={`${entitlements.monthlyUsage.toLocaleString("en-US")} / ${formatLimit(entitlements.plan.monthlyLeads)}`}
        />
        <StatCard
          label="Renews / ends"
          value={
            entitlements.currentPeriodEnd ? formatDate(entitlements.currentPeriodEnd) : "No renewal"
          }
          hint={entitlements.cancelAtPeriodEnd ? "Cancels at period end" : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">Submission usage</h2>
          <div className="mt-4">
            <UsageBar
              used={entitlements.monthlyUsage}
              limit={entitlements.plan.monthlyLeads}
              label="Monthly submissions"
            />
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">Resource usage</h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-foreground-secondary">Active forms</dt>
              <dd className="font-medium text-foreground">
                {entitlements.activeFormCount} / {entitlements.plan.forms}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-foreground-secondary">Client viewers</dt>
              <dd className="font-medium text-foreground">
                {entitlements.viewerCount} / {entitlements.plan.viewers}
              </dd>
            </div>
          </dl>
          {entitlements.providerSubscriptionId ? (
            <form action={openBillingPortalAction} className="mt-4">
              <Button type="submit" variant="secondary" size="sm">
                Manage subscription
              </Button>
            </form>
          ) : null}
        </section>
      </div>

      <section aria-labelledby="plans-heading" className="flex flex-col gap-4">
        <h2 id="plans-heading" className="text-base font-semibold text-foreground">
          Plans
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLAN_ORDER.map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = planKey === entitlements.planKey;
            const paid = planKey !== "free";
            return (
              <div
                key={planKey}
                className={cn(
                  "flex flex-col gap-4 rounded-lg border bg-surface p-5",
                  isCurrent ? "border-accent" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                  {isCurrent ? <Badge tone="accent">Current plan</Badge> : null}
                </div>
                <p className="text-sm text-foreground-secondary">{plan.description}</p>
                <p className="text-2xl font-semibold text-foreground">
                  ${plan.priceMonthly}
                  <span className="text-sm font-normal text-foreground-muted"> / month</span>
                </p>
                <ul className="flex flex-1 flex-col gap-2 text-sm text-foreground-secondary">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button disabled variant="secondary">
                    Your current plan
                  </Button>
                ) : paid ? (
                  <CheckoutButton
                    plan={planKey === "pro" ? "pro" : "agency"}
                    label={`Upgrade to ${plan.name}`}
                    disabled={!billing.configured}
                    disabledLabel="Billing not configured"
                  />
                ) : (
                  <p className="text-xs text-foreground-muted">
                    Downgrade by cancelling your subscription in the customer portal. Existing data
                    is retained.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
