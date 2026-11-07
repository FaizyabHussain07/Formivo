"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { captureAttribution } from "@/lib/analytics/attribution";
import { initAnalytics, track, trackPageView } from "@/lib/analytics/client";
import type { AnalyticsEvent } from "@/lib/analytics/events";

/** Events a server action leaves behind for the next page to report. */
const INTENT_COOKIE = "formivo_evt";

const KNOWN_EVENTS = new Set<string>([
  "sign_up",
  "login",
  "form_created",
  "form_published",
  "client_invited",
  "client_joined",
  "feedback_submitted",
  "checkout_started",
  "subscription_activated",
  "prompt_copied",
]);

function readAndClearIntent(): AnalyticsEvent[] {
  if (typeof document === "undefined") return [];
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${INTENT_COOKIE}=`));
  if (!entry) return [];

  const raw = decodeURIComponent(entry.slice(INTENT_COOKIE.length + 1));
  document.cookie = `${INTENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is AnalyticsEvent => KNOWN_EVENTS.has(value));
}

/**
 * Loads GA4 and PostHog after hydration, records the traffic source once, reports every
 * client-side navigation, and applies conversion events queued by server actions.
 *
 * It renders nothing and is safe to mount on every page, including when no analytics
 * provider is configured.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    captureAttribution();
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    const firstRender = lastPath.current === null;
    lastPath.current = pathname;

    // Attribution is refreshed before the page view so the source is attached to
    // the session's first hit.
    captureAttribution();
    trackPageView(pathname, window.location.search);

    if (firstRender) {
      for (const event of readAndClearIntent()) track(event);
    }
  }, [pathname]);

  return null;
}
