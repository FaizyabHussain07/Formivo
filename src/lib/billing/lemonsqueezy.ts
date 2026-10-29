import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getIntegrationStatus } from "@/lib/env/integrations";
import { getServerEnv } from "@/lib/env/server";
import { AppError } from "@/lib/errors";
import type { PlanKey } from "@/lib/billing/plans";
import { isPlanKey } from "@/lib/billing/plans";
import { requireAdminClient } from "@/lib/supabase/admin";

const LS_API = "https://api.lemonsqueezy.com/v1";

export type BillingConfig = {
  configured: boolean;
  missing: string[];
};

export function getBillingConfig(): BillingConfig {
  const status = getIntegrationStatus(getServerEnv(), "lemonsqueezy");
  return { configured: status.configured, missing: status.missing };
}

function variantForPlan(plan: PlanKey): string | undefined {
  const env = getServerEnv();
  if (plan === "pro") return env.LEMONSQUEEZY_PRO_VARIANT_ID;
  if (plan === "agency") return env.LEMONSQUEEZY_AGENCY_VARIANT_ID;
  return undefined;
}

export function planForVariant(variantId: string | null | undefined): PlanKey | null {
  if (!variantId) return null;
  const env = getServerEnv();
  if (env.LEMONSQUEEZY_PRO_VARIANT_ID === variantId) return "pro";
  if (env.LEMONSQUEEZY_AGENCY_VARIANT_ID === variantId) return "agency";
  return null;
}

export async function createCheckoutUrl(input: {
  workspaceId: string;
  plan: PlanKey;
  email: string;
  appUrl: string;
}): Promise<string> {
  const env = getServerEnv();
  if (!getBillingConfig().configured) {
    throw new AppError("NOT_CONFIGURED", "Billing is not configured on this deployment.");
  }

  const variantId = variantForPlan(input.plan);
  if (!variantId) {
    throw new AppError("INVALID_REQUEST", "This plan does not require checkout.");
  }

  const response = await fetch(`${LS_API}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: input.email,
            custom: { workspace_id: input.workspaceId, plan: input.plan },
          },
          product_options: {
            redirect_url: `${input.appUrl}/billing?checkout=success`,
            enabled_variants: [Number(variantId)],
          },
        },
        relationships: {
          store: { data: { type: "stores", id: String(env.LEMONSQUEEZY_STORE_ID) } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new AppError("INTERNAL_ERROR", "The checkout could not be created. Please try again.");
  }

  const body = (await response.json()) as {
    data?: { attributes?: { url?: string } };
  };
  const url = body.data?.attributes?.url;
  if (!url || !url.startsWith("https://")) {
    throw new AppError("INTERNAL_ERROR", "The checkout URL was missing from the provider response.");
  }
  return url;
}

export async function getCustomerPortalUrl(subscriptionId: string): Promise<string | null> {
  const env = getServerEnv();
  if (!getBillingConfig().configured || !env.LEMONSQUEEZY_API_KEY) return null;

  const response = await fetch(`${LS_API}/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    headers: {
      Authorization: `Bearer ${env.LEMONSQUEEZY_API_KEY}`,
      Accept: "application/vnd.api+json",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) return null;

  const body = (await response.json()) as {
    data?: { attributes?: { urls?: { customer_portal?: string } } };
  };
  const url = body.data?.attributes?.urls?.customer_portal;
  return url?.startsWith("https://") ? url : null;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = Buffer.from(
    createHmac("sha256", secret).update(rawBody).digest("hex"),
    "utf8",
  );
  const actual = Buffer.from(signature, "utf8");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

type LemonsqueezyWebhook = {
  meta?: {
    event_name?: string;
    custom_data?: { workspace_id?: string; plan?: string };
  };
  data?: {
    id?: string;
    type?: string;
    attributes?: {
      status?: string;
      variant_id?: number | string;
      customer_id?: number | string;
      renews_at?: string | null;
      ends_at?: string | null;
      created_at?: string | null;
      cancelled?: boolean;
      trial_ends_at?: string | null;
    };
  };
};

const STATUS_MAP: Record<string, string> = {
  on_trial: "on_trial",
  active: "active",
  paused: "paused",
  past_due: "past_due",
  unpaid: "past_due",
  cancelled: "cancelled",
  expired: "expired",
};

const SUPPORTED_EVENTS = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
  "subscription_payment_failed",
  "subscription_payment_success",
]);

/**
 * Verifies, deduplicates and applies a Lemon Squeezy webhook. The database row is
 * the source of truth the UI reads; no checkout redirect ever mutates billing.
 */
export async function processLemonsqueezyWebhook(input: {
  rawBody: string;
  signature: string | null;
  eventId: string;
}): Promise<{ handled: boolean; duplicate: boolean }> {
  const env = getServerEnv();
  const secret = env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) throw new AppError("NOT_CONFIGURED", "Billing webhooks are not configured.");

  if (!verifyWebhookSignature(input.rawBody, input.signature, secret)) {
    throw new AppError("WEBHOOK_INVALID");
  }

  let payload: LemonsqueezyWebhook;
  try {
    payload = JSON.parse(input.rawBody) as LemonsqueezyWebhook;
  } catch {
    throw new AppError("WEBHOOK_INVALID");
  }

  const eventName = payload.meta?.event_name ?? "unknown";
  if (!SUPPORTED_EVENTS.has(eventName)) {
    return { handled: false, duplicate: false };
  }

  const admin = requireAdminClient();
  const eventId =
    input.eventId ||
    `${eventName}:${payload.data?.id ?? "unknown"}:${payload.data?.attributes?.status ?? ""}`;

  const { error: eventError } = await admin.from("webhook_events").insert({
    provider: "lemonsqueezy",
    provider_event_id: eventId,
    event_type: eventName,
    payload_hash: null,
    processed_at: new Date().toISOString(),
  });
  if (eventError) {
    if (eventError.code === "23505") return { handled: true, duplicate: true };
    throw new AppError("INTERNAL_ERROR", eventError.message);
  }

  const attributes = payload.data?.attributes ?? {};
  const customWorkspaceId = payload.meta?.custom_data?.workspace_id;

  let workspaceId = customWorkspaceId;
  if (!workspaceId && payload.data?.id) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("workspace_id")
      .eq("provider_subscription_id", String(payload.data.id))
      .maybeSingle();
    workspaceId = existing?.workspace_id;
  }

  if (!workspaceId) {
    // Nothing to apply yet; the event is recorded so it is never replayed twice.
    return { handled: false, duplicate: false };
  }

  const variantPlan = planForVariant(
    attributes.variant_id !== undefined ? String(attributes.variant_id) : null,
  );
  const customPlan = payload.meta?.custom_data?.plan;
  const planKey: PlanKey = isPlanKey(customPlan ?? "")
    ? (customPlan as PlanKey)
    : (variantPlan ?? "free");

  const status = STATUS_MAP[attributes.status ?? ""] ?? "active";
  const periodEnd = attributes.renews_at ?? attributes.ends_at ?? null;

  const { error: updateError } = await admin.from("subscriptions").upsert(
    {
      workspace_id: workspaceId,
      plan_key: planKey,
      status,
      provider: "lemonsqueezy",
      provider_customer_id:
        attributes.customer_id !== undefined ? String(attributes.customer_id) : null,
      provider_subscription_id: payload.data?.id ? String(payload.data.id) : null,
      variant_id: attributes.variant_id !== undefined ? String(attributes.variant_id) : null,
      current_period_start: attributes.created_at ?? null,
      current_period_end: periodEnd,
      cancel_at_period_end: Boolean(attributes.cancelled),
    },
    { onConflict: "workspace_id" },
  );
  if (updateError) throw new AppError("INTERNAL_ERROR", updateError.message);

  await admin.from("audit_logs").insert({
    workspace_id: workspaceId,
    action: "billing.webhook_applied",
    target_type: "subscription",
    target_id: payload.data?.id ? String(payload.data.id) : null,
    metadata: { event: eventName, plan: planKey, status },
  });

  return { handled: true, duplicate: false };
}
