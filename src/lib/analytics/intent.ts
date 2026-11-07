import "server-only";

import { cookies } from "next/headers";

import type { AnalyticsEvent } from "./events";

const INTENT_COOKIE = "formivo_evt";
const MAX_AGE_SECONDS = 180;

/**
 * Queues a conversion event for the browser to report on the next render.
 *
 * Server actions cannot reach the analytics SDKs directly (GA4 and PostHog live in the
 * browser), so an action records the event name in a short-lived cookie and the
 * analytics provider sends it once, then deletes it. That keeps the event accurate and
 * independent of which page the user lands on.
 *
 * Must be called from a Server Action or Route Handler, where cookies are writable.
 */
export async function queueAnalyticsEvent(...events: AnalyticsEvent[]): Promise<void> {
  if (events.length === 0) return;
  try {
    const store = await cookies();
    const existing = store.get(INTENT_COOKIE)?.value ?? "";
    const merged = new Set(
      [...existing.split(","), ...events].map((value) => value.trim()).filter(Boolean),
    );
    store.set(INTENT_COOKIE, Array.from(merged).join(","), {
      path: "/",
      maxAge: MAX_AGE_SECONDS,
      sameSite: "lax",
      httpOnly: false,
    });
  } catch {
    // A read-only render context simply skips the event; analytics must never fail a flow.
  }
}
