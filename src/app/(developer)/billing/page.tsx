import { Check } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { openBillingPortalAction } from "@/app/(developer)/billing/actions";
import { TrackView } from "@/components/analytics/track-view";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, UsageBar } from "@/components/ui/stat-card";
import { requireDeveloper } from "@/lib/auth/viewer";
import { getPaymentAvailability } from "@/lib/billing/availability";
import { PLANS, PLAN_ORDER, formatLimit, isPaidPlan } from "@/lib/billing/plans";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Billing", robots: { index: false } };

type SearchParams = Promise<{ checkout?: string; portal?: string; plan?: string }>;

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
  const payments = getPaymentAvailability();
  const entitlements = developer.entitlements;
  const requestedPlan =
    sp.plan && isPaidPlan(sp.plan) && sp.plan !== entitlements.planKey ? sp.plan : null;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Billing" description="Plans, usage and subscription for this workspace." />

      {sp.checkout === "success" ? (
        <Alert tone="info" title="Payment received">
          Paddle is confirming the subscription with a signed webhook. This page updates as soon as
          the verified event arrives. If the plan below is still unchanged, wait a few seconds and
          refresh.
        </Alert>
      ) : null}

      {requestedPlan ? (
        <Alert tone="info" title={`Continue with the ${PLANS[requestedPlan].name} plan`}>
          Your account was created. Choose {PLANS[requestedPlan].name} below to finish checkout.
          Nothing is charged until you complete payment.
        </Alert>
      ) : null}

      {sp.portal === "unavailable" ? (
        <Alert tone="warning" title="Subscription portal unavailable">
          No Paddle customer is linked to this workspace yet, or the provider could not be reached.
          If you just subscribed, wait for the webhook and try again.
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Current plan"
          value={entitlements.plan.name}
          hint={`Status: ${entitlements.subscriptionStatus.replace("_", " ")}`}
        />
        <StatCard
          label="Submissions this cycle"
          value={`${entitlements.monthlyUsage.toLocaleString("en-US")} / ${formatLimit(entitlements.plan.monthlyLeads)}`}
        />
        <StatCard
          label={entitlements.cancelAtPeriodEnd ? "Access ends" : "Renews"}
          value={
            entitlements.currentPeriodEnd ? formatDate(entitlements.currentPeriodEnd) : "No renewal"
          }
          hint={entitlements.planKey === "free" ? "Free plan never renews" : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-base font-semibold text-foreground">Submission usage</h2>
          <p className="mt-1 text-xs text-foreground-muted">
            Window: {formatDate(entitlements.usageWindowStart.toISOString())} to{" "}
            {formatDate(entitlements.usageWindowEnd.toISOString())}
          </p>
          <div className="mt-4">
            <UsageBar
              used={entitlements.monthlyUsage}
              limit={entitlements.plan.monthlyLeads}
              label="Monthly submissions"
            />
          </div>
          {!entitlements.canAcceptSubmission ? (
            <p className="mt-3 text-xs text-warning">
              The limit is reached, so new submissions are rejected until the window resets. Stored
              submissions are never deleted.
            </p>
          ) : null}
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
              <dt className="text-foreground-secondary">Client views</dt>
              <dd className="font-medium text-foreground">
                {entitlements.viewerCount} / {entitlements.plan.viewers}
              </dd>
            </div>
          </dl>
          {entitlements.providerCustomerId ? (
            <form action={openBillingPortalAction} className="mt-4">
              <Button type="submit" variant="secondary" size="sm">
                Manage payment and invoices
              </Button>
            </form>
          ) : (
            <p className="mt-4 text-xs text-foreground-muted">
              Payment methods, invoices and cancellation open in the Paddle customer portal after
              your first paid subscription.
            </p>
          )}
        </section>
      </div>

      <section aria-labelledby="plans-heading" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="plans-heading" className="text-base font-semibold text-foreground">
            Plans
          </h2>
          <p className="text-xs text-foreground-muted">
            {payments.checkoutEnabled
              ? payments.note
              : "Paid plans are not open on this deployment yet."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLAN_ORDER.map((planKey) => {
            const plan = PLANS[planKey];
            const isCurrent = planKey === entitlements.planKey;
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
                  {isCurrent ? <Badge tone="accent">Current</Badge> : null}
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
                ) : isPaidPlan(planKey) ? (
                  <CheckoutButton
                    plan={planKey}
                    label={
                      entitlements.providerSubscriptionId ? `Switch to ${plan.name}` : `Choose ${plan.name}`
                    }
                    disabled={!payments.checkoutEnabled}
                    disabledLabel={payments.label}
                  />
                ) : (
                  <p className="text-xs text-foreground-muted">
                    Change to Free by cancelling in the Paddle customer portal. Your data and forms
                    stay exactly where they are.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="text-xs leading-5 text-foreground-muted">
        Team seats are not available yet: a workspace has a single owner account, and client views
        are read-only accounts instead of seats.
      </p>

      {sp.checkout === "success" && entitlements.planKey !== "free" ? (
        <TrackView event="purchase" properties={{ plan: entitlements.planKey }} />
      ) : null}
    </div>
  );
}
