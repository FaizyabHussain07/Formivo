import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getIntegrationStatus } from "@/lib/env/integrations";
import { getServerEnv } from "@/lib/env/server";
import { AppError } from "@/lib/errors";
import { requireAdminClient } from "@/lib/supabase/admin";

import { isPlanKey, isPaidPlan, type PlanKey } from "./plans";

/**
 * Paddle Billing integration.
 *
 * Trust model:
 *   - The browser never decides a plan. It receives a transaction id created by the
 *     server for a specific price and a specific workspace.
 *   - Entitlements only change when a signed webhook arrives and is applied here.
 *   - Sandbox and live are separate API hosts, selected by PADDLE_ENVIRONMENT, so a
 *     sandbox key can never create a live charge.
 */

const SANDBOX_API = "https://sandbox-api.paddle.com";
const LIVE_API = "https://api.paddle.com";

export type PaddleEnvironment = "sandbox" | "production";

export type BillingConfig = {
  configured: boolean;
  missing: string[];
  environment: PaddleEnvironment;
  /** Public client token, safe to send to the browser. */
  clientToken: string | undefined;
};

export function getPaddleEnvironment(): PaddleEnvironment {
  return getServerEnv().PADDLE_ENVIRONMENT === "production" ? "production" : "sandbox";
}

export function paddleApiBase(environment = getPaddleEnvironment()): string {
  return environment === "production" ? LIVE_API : SANDBOX_API;
}

export function getBillingConfig(): BillingConfig {
  const env = getServerEnv();
  const status = getIntegrationStatus(env, "paddle");
  return {
    configured: status.configured,
    missing: status.missing,
    environment: getPaddleEnvironment(),
    clientToken: env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
  };
}

function priceIdForPlan(plan: PlanKey): string | undefined {
  const env = getServerEnv();
  if (plan === "light") return env.PADDLE_PRICE_LIGHT;
  if (plan === "pro") return env.PADDLE_PRICE_PRO;
  if (plan === "agency") return env.PADDLE_PRICE_AGENCY;
  return undefined;
}

/** Maps a Paddle price id back to a plan. Unknown prices return null. */
export function planForPriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null;
  const env = getServerEnv();
  if (env.PADDLE_PRICE_LIGHT === priceId) return "light";
  if (env.PADDLE_PRICE_PRO === priceId) return "pro";
  if (env.PADDLE_PRICE_AGENCY === priceId) return "agency";
  return null;
}

async function paddleRequest<T>(
  path: string,
  init: { method: "GET" | "POST" | "PATCH"; body?: unknown; idempotencyKey?: string },
): Promise<T> {
  const env = getServerEnv();
  if (!env.PADDLE_API_KEY) {
    throw new AppError("NOT_CONFIGURED", "Billing is not configured on this deployment.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.PADDLE_API_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (init.idempotencyKey) headers["Paddle-Idempotency-Key"] = init.idempotencyKey;

  const response = await fetch(`${paddleApiBase()}${path}`, {
    method: init.method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });

  if (!response.ok) {
    // The provider body can contain account details, so only the status is surfaced.
    console.error(`Paddle ${init.method} ${path} failed with status ${response.status}`);
    throw new AppError("INTERNAL_ERROR", "Paddle could not complete that request.");
  }

  return (await response.json()) as T;
}

export type CheckoutSession = {
  transactionId: string;
  /** Provider-hosted checkout URL, used when the overlay cannot be loaded. */
  checkoutUrl: string | null;
  priceId: string;
  environment: PaddleEnvironment;
  clientToken: string;
};

/**
 * Creates a Paddle transaction for one price and attaches the workspace and plan as
 * custom data. The client opens it with Paddle.js; the transaction id alone cannot
 * change the plan, so tampering with the browser is pointless.
 */
export async function createCheckoutTransaction(input: {
  workspaceId: string;
  plan: PlanKey;
  appUrl: string;
}): Promise<CheckoutSession> {
  if (!isPaidPlan(input.plan)) {
    throw new AppError("INVALID_REQUEST", "This plan does not require checkout.");
  }

  const config = getBillingConfig();
  const priceId = priceIdForPlan(input.plan);
  if (!config.configured || !priceId || !config.clientToken) {
    throw new AppError("NOT_CONFIGURED", "Billing is not configured on this deployment.");
  }

  const body = {
    items: [{ price_id: priceId, quantity: 1 }],
    custom_data: {
      workspace_id: input.workspaceId,
      plan: input.plan,
    },
    checkout: {
      url: `${input.appUrl}/billing?checkout=success`,
    },
  };

  const result = await paddleRequest<{
    data?: { id?: string; checkout?: { url?: string | null } | null };
  }>("/transactions", {
    method: "POST",
    body,
    // One click, one transaction. A retried request reuses the same provider record
    // when the caller supplies the same id.
    idempotencyKey: `checkout-${input.workspaceId}-${input.plan}-${Math.floor(Date.now() / 60_000)}`,
  });

  const transactionId = result.data?.id;
  if (!transactionId) {
    throw new AppError("INTERNAL_ERROR", "Paddle did not return a transaction id.");
  }

  return {
    transactionId,
    checkoutUrl: result.data?.checkout?.url ?? null,
    priceId,
    environment: config.environment,
    clientToken: config.clientToken,
  };
}

/**
 * Changes the price on an existing subscription with immediate proration.
 * Entitlements are still applied only by the resulting webhook, never by this call.
 */
export async function updateSubscriptionPlan(input: {
  subscriptionId: string;
  plan: PlanKey;
}): Promise<void> {
  if (!isPaidPlan(input.plan)) {
    throw new AppError("INVALID_REQUEST", "Cancelling is done from the customer portal.");
  }

  const priceId = priceIdForPlan(input.plan);
  if (!getBillingConfig().configured || !priceId) {
    throw new AppError("NOT_CONFIGURED", "Billing is not configured on this deployment.");
  }

  await paddleRequest(`/subscriptions/${encodeURIComponent(input.subscriptionId)}`, {
    method: "PATCH",
    body: {
      items: [{ price_id: priceId, quantity: 1 }],
      proration_billing_mode: "prorated_immediately",
      custom_data: { plan: input.plan },
    },
  });
}

/** Authenticated Paddle customer portal for an existing customer id. */
export async function getCustomerPortalUrl(customerId: string): Promise<string | null> {
  if (!getBillingConfig().configured || !customerId) return null;

  try {
    const result = await paddleRequest<{
      data?: { urls?: { general?: { overview?: string } } };
    }>(`/customers/${encodeURIComponent(customerId)}/portal-sessions`, {
      method: "POST",
      body: {},
    });
    const url = result.data?.urls?.general?.overview;
    return url?.startsWith("https://") ? url : null;
  } catch {
    return null;
  }
}

/**
 * Verifies the `Paddle-Signature` header: `ts=<unix>;h1=<hex hmac>`.
 * The signed payload is `${ts}:${rawBody}` and the digest is HMAC-SHA256.
 */
export function verifyPaddleSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  if (!header) return false;

  const parts = new Map<string, string>();
  for (const chunk of header.split(";")) {
    const [key, value] = chunk.split("=");
    if (key && value) parts.set(key.trim(), value.trim());
  }

  const timestamp = parts.get("ts");
  const signatures = parts.get("h1");
  if (!timestamp || !signatures) return false;

  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return false;
  // Reject stale signatures so a captured request cannot be replayed later.
  if (Math.abs(Math.floor(Date.now() / 1000) - seconds) > toleranceSeconds) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}:${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");

  // Paddle may send several signatures during a secret rotation; any match is valid.
  return signatures.split(",").some((candidate) => {
    const actual = Buffer.from(candidate.trim(), "utf8");
    return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer);
  });
}

type PaddleWebhook = {
  event_id?: string;
  event_type?: string;
  occurred_at?: string;
  data?: {
    id?: string;
    status?: string;
    customer_id?: string;
    subscription_id?: string | null;
    action?: string;
    custom_data?: { workspace_id?: string; plan?: string } | null;
    items?: { price?: { id?: string } }[];
    current_billing_period?: { starts_at?: string | null; ends_at?: string | null } | null;
    billing_period?: { starts_at?: string | null; ends_at?: string | null } | null;
    scheduled_change?: { action?: string; effective_at?: string } | null;
    details?: { totals?: { total?: string; currency_code?: string } };
    currency_code?: string;
    payout_totals?: unknown;
  };
};

const PADDLE_STATUS: Record<string, string> = {
  active: "active",
  activated: "active",
  trialing: "on_trial",
  past_due: "past_due",
  paused: "paused",
  canceled: "cancelled",
  cancelled: "cancelled",
  expired: "expired",
};

/** Events that can change or confirm subscription state. */
const HANDLED_EVENTS = new Set([
  "transaction.completed",
  "transaction.paid",
  "transaction.payment_failed",
  "subscription.created",
  "subscription.activated",
  "subscription.updated",
  "subscription.trialing",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
  "subscription.canceled",
  "adjustment.created",
  "adjustment.updated",
]);

export type WebhookResult = { handled: boolean; duplicate: boolean; reason?: string };

async function resolveWorkspaceId(
  customWorkspaceId: string | undefined,
  subscriptionId: string | null | undefined,
): Promise<string | null> {
  if (customWorkspaceId) return customWorkspaceId;
  if (!subscriptionId) return null;

  const admin = requireAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("workspace_id")
    .eq("provider_subscription_id", subscriptionId)
    .maybeSingle();
  return data?.workspace_id ?? null;
}

async function currentPlanForWorkspace(workspaceId: string): Promise<PlanKey> {
  const admin = requireAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("plan_key")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return isPlanKey(data?.plan_key ?? "") ? ((data?.plan_key ?? "free") as PlanKey) : "free";
}

/** PostgREST reports an unknown column as PGRST204 or as a 42703 message. */
function isMissingColumnError(error: { code?: string; message?: string }): boolean {
  if (error.code === "PGRST204") return true;
  return /column .* does not exist|could not find the '.*' column/i.test(error.message ?? "");
}

/**
 * Verifies, deduplicates and applies a Paddle webhook.
 *
 * The database row is the only state the app reads. A successful checkout redirect
 * never grants a plan; only a verified event does. Duplicate deliveries are rejected
 * by the (provider, event_id) unique constraint.
 */
export async function processPaddleWebhook(input: {
  rawBody: string;
  signature: string | null;
}): Promise<WebhookResult> {
  const env = getServerEnv();
  const secret = env.PADDLE_WEBHOOK_SECRET;
  if (!secret) throw new AppError("NOT_CONFIGURED", "Billing webhooks are not configured.");

  if (!verifyPaddleSignature(input.rawBody, input.signature, secret)) {
    throw new AppError("WEBHOOK_INVALID");
  }

  let payload: PaddleWebhook;
  try {
    payload = JSON.parse(input.rawBody) as PaddleWebhook;
  } catch {
    throw new AppError("WEBHOOK_INVALID");
  }

  const eventType = payload.event_type ?? "unknown";
  const eventId = payload.event_id;
  if (!eventId) throw new AppError("WEBHOOK_INVALID", "The event id is missing.");

  if (!HANDLED_EVENTS.has(eventType)) {
    return { handled: false, duplicate: false, reason: "unhandled_event" };
  }

  const admin = requireAdminClient();
  const { error: eventError } = await admin.from("webhook_events").insert({
    provider: "paddle",
    provider_event_id: eventId,
    event_type: eventType,
    payload_hash: null,
    processed_at: new Date().toISOString(),
  });
  if (eventError) {
    if (eventError.code === "23505") return { handled: true, duplicate: true };
    throw new AppError("INTERNAL_ERROR", eventError.message);
  }

  const data = payload.data ?? {};
  const subscriptionId =
    eventType.startsWith("subscription.") ? (data.id ?? null) : (data.subscription_id ?? null);

  const workspaceId = await resolveWorkspaceId(data.custom_data?.workspace_id, subscriptionId);
  if (!workspaceId) {
    // Recorded so it is never processed twice, but nothing to apply yet.
    return { handled: false, duplicate: false, reason: "unknown_workspace" };
  }

  // A refund or credit note is recorded for audit but never silently changes the
  // plan: access follows the subscription, not one adjustment.
  if (eventType.startsWith("adjustment.")) {
    await admin.from("audit_logs").insert({
      workspace_id: workspaceId,
      action: "billing.adjustment_received",
      target_type: "subscription",
      target_id: subscriptionId,
      metadata: { event: eventType, action: data.action ?? null },
    });
    return { handled: true, duplicate: false };
  }

  const priceId = data.items?.[0]?.price?.id ?? null;
  const customPlan = data.custom_data?.plan;
  const planKey: PlanKey =
    (isPlanKey(customPlan ?? "") ? (customPlan as PlanKey) : null) ??
    planForPriceId(priceId) ??
    (await currentPlanForWorkspace(workspaceId));

  const providerStatus = data.status ?? "active";
  const status =
    eventType === "transaction.payment_failed"
      ? "past_due"
      : (PADDLE_STATUS[providerStatus] ?? "active");

  const period = data.current_billing_period ?? data.billing_period ?? null;
  const existing = await admin
    .from("subscriptions")
    .select("current_period_start, current_period_end")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const periodStart =
    period?.starts_at ?? existing.data?.current_period_start ?? new Date().toISOString();
  const periodEnd = period?.ends_at ?? existing.data?.current_period_end ?? null;

  const row = {
    workspace_id: workspaceId,
    plan_key: planKey,
    status,
    provider: "paddle",
    provider_subscription_id: subscriptionId,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: data.scheduled_change?.action === "cancel",
  };
  // The Paddle-only columns arrive with a migration. If a deployment is running its
  // code before that migration, the billing state still has to be stored: write the
  // portable columns instead of failing the whole webhook.
  const extendedRow = {
    ...row,
    provider_customer_id: data.customer_id ?? null,
    price_id: priceId,
    scheduled_change_action: data.scheduled_change?.action ?? null,
  };

  let { error: updateError } = await admin
    .from("subscriptions")
    .upsert(extendedRow, { onConflict: "workspace_id" });
  if (updateError && isMissingColumnError(updateError)) {
    ({ error: updateError } = await admin
      .from("subscriptions")
      .upsert(row, { onConflict: "workspace_id" }));
  }
  if (updateError) throw new AppError("INTERNAL_ERROR", updateError.message);

  await admin.from("audit_logs").insert({
    workspace_id: workspaceId,
    action: "billing.webhook_applied",
    target_type: "subscription",
    target_id: subscriptionId,
    metadata: { event: eventType, plan: planKey, status },
  });

  return { handled: true, duplicate: false };
}
