import {
  isOncePerSession,
  isValidEventName,
  type AnalyticsEvent,
  type AnalyticsProperties,
} from "./events";
import { attributionProperties, readAttribution } from "./attribution";

type AnalyticsConfig = {
  gaMeasurementId?: string;
  posthogKey?: string;
  posthogHost?: string;
  /** Session replay is opt-in: it records screens, so it is off unless configured. */
  replayEnabled?: boolean;
};

type PosthogClient = {
  init: (key: string, options: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (distinctId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  opt_out_capturing?: () => void;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    posthog?: PosthogClient;
  }
}

const CONFIG: AnalyticsConfig = {
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
  replayEnabled: process.env.NEXT_PUBLIC_POSTHOG_REPLAY === "1",
};

const POSTHOG_SCRIPT_ID = "formivo-posthog";
const GA_SCRIPT_ID = "formivo-ga";

let started = false;
let consentGranted = true;
let posthogReady = false;
/** Calls made before posthog-js finished loading, replayed once it is up. */
const posthogQueue: Array<() => void> = [];
const identifiedUsers = new Set<string>();

function runOnPosthog(run: () => void): void {
  if (posthogReady) run();
  else posthogQueue.push(run);
}

export function analyticsEnabled(): boolean {
  return Boolean(CONFIG.gaMeasurementId || CONFIG.posthogKey);
}

export function isConsentGranted(): boolean {
  return consentGranted;
}

/** A visitor who declines tracking stops every outbound call without a reload. */
export function setConsent(granted: boolean): void {
  consentGranted = granted;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("formivo:analytics-consent", granted ? "granted" : "denied");
  } catch {
    // Storage can be unavailable; consent then lasts for the page session only.
  }
  if (!granted && window.posthog?.opt_out_capturing) window.posthog.opt_out_capturing();
}

export function readStoredConsent(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem("formivo:analytics-consent") !== "denied";
  } catch {
    return true;
  }
}

function loadScript(id: string, src: string, onLoad?: () => void): void {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    if (!onLoad) return;
    if (existing.dataset.loaded === "1") onLoad();
    else existing.addEventListener("load", onLoad, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  if (onLoad) {
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "1";
        onLoad();
      },
      { once: true },
    );
  }
  document.head.appendChild(script);
}

function initGa4(measurementId: string): void {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
  window.gtag("js", new Date());
  // Page views are sent explicitly on navigation so a client-side route change is
  // never counted twice. send_page_view:false is what prevents the duplicate that a
  // default gtag config would add on every SPA route change.
  window.gtag("config", measurementId, {
    send_page_view: false,
    // DebugView is opt-in per environment instead of always on.
    ...(process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? {} : { debug_mode: true }),
  });
  loadScript(GA_SCRIPT_ID, `https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
}

function initPosthog(key: string, host: string, replayEnabled: boolean): void {
  // array.js only defines `window.posthog` once it has executed, so init waits for
  // the script's load event and every call made until then is replayed after init.
  loadScript(POSTHOG_SCRIPT_ID, `${host.replace(/\/$/, "")}/static/array.js`, () => {
    window.posthog?.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: false,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
      disable_session_recording: !replayEnabled,
      session_recording: replayEnabled
        ? { maskAllInputs: true, maskTextSelector: "[data-private]" }
        : undefined,
    });
    posthogReady = true;
    for (const queued of posthogQueue.splice(0)) {
      try {
        queued();
      } catch {
        // One replayed call must not break the rest.
      }
    }
  });
}

/** GA4 measurement IDs always look like G-XXXXXXX. Anything else would never report. */
function isGaMeasurementId(value: string): boolean {
  return /^G-[A-Z0-9]{6,}$/i.test(value.trim());
}

/** Loads both platforms once, after hydration, and never blocks the page. */
export function initAnalytics(): void {
  if (typeof window === "undefined" || started || !analyticsEnabled()) return;
  started = true;

  const granted = readStoredConsent();
  setConsent(granted);
  if (!granted) return;

  if (CONFIG.gaMeasurementId) {
    if (isGaMeasurementId(CONFIG.gaMeasurementId)) initGa4(CONFIG.gaMeasurementId.trim());
    else if (process.env.NODE_ENV !== "production")
      console.warn("NEXT_PUBLIC_GA_MEASUREMENT_ID is not a GA4 measurement id (G-XXXXXXX).");
  }
  if (CONFIG.posthogKey)
    initPosthog(CONFIG.posthogKey, CONFIG.posthogHost ?? "", CONFIG.replayEnabled ?? false);
}

function sessionMarker(event: AnalyticsEvent): string {
  return `formivo:event:${event}`;
}

function alreadyTrackedThisSession(event: AnalyticsEvent): boolean {
  try {
    if (window.sessionStorage.getItem(sessionMarker(event))) return true;
    window.sessionStorage.setItem(sessionMarker(event), "1");
    return false;
  } catch {
    return false;
  }
}

/**
 * Sends one event to every configured platform. Safe to call before analytics has
 * loaded, on the server, or when a provider is unset: it never throws.
 */
export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): void {
  if (typeof window === "undefined" || !consentGranted) return;
  if (!isValidEventName(event)) return;
  if (isOncePerSession(event) && alreadyTrackedThisSession(event)) return;

  const payload: Record<string, unknown> = {
    ...attributionProperties(readAttribution()),
    ...Object.fromEntries(
      Object.entries(properties).filter(([, value]) => value !== undefined && value !== null),
    ),
  };

  try {
    window.gtag?.("event", event, payload);
  } catch {
    // A blocked tag manager must not break the page.
  }

  runOnPosthog(() => {
    try {
      window.posthog?.capture(event, payload);
    } catch {
      // Same for PostHog.
    }
  });
}

/** A page view is a navigation, not a conversion, so it is never deduplicated. */
export function trackPageView(path: string, search = ""): void {
  if (typeof window === "undefined" || !consentGranted) return;
  const payload = {
    page_path: `${path}${search}`,
    page_title: document.title,
    ...attributionProperties(readAttribution()),
  };

  try {
    window.gtag?.("event", "page_view", {
      ...payload,
      page_location: window.location.href,
      page_referrer: document.referrer || undefined,
    });
  } catch {
    // ignore
  }
  runOnPosthog(() => {
    try {
      window.posthog?.capture("$pageview", payload);
    } catch {
      // ignore
    }
  });
}

/** Only an internal user id is sent; email and display name never leave the account. */
export function identifyUser(userId: string, properties: AnalyticsProperties = {}): void {
  if (typeof window === "undefined" || !consentGranted) return;
  if (identifiedUsers.has(userId)) return;
  identifiedUsers.add(userId);

  try {
    window.gtag?.("set", { user_id: userId });
  } catch {
    // ignore
  }
  runOnPosthog(() => {
    try {
      window.posthog?.identify(userId, {
        ...attributionProperties(readAttribution()),
        ...properties,
      });
    } catch {
      // ignore
    }
  });
}

export function resetAnalyticsIdentity(): void {
  identifiedUsers.clear();
  runOnPosthog(() => {
    try {
      window.posthog?.reset();
    } catch {
      // ignore
    }
  });
}
