/**
 * First-touch and last-touch traffic attribution, stored in the browser only.
 *
 * Nothing here runs on the server: attribution is captured from the URL and the
 * referrer, kept in localStorage, and attached to the account as metadata at sign-up.
 * A value that is missing simply stays missing, so a direct visit never overwrites a
 * real campaign.
 */

export type Attribution = {
  source: string | null;
  medium: string | null;
  campaign: string | null;
  term: string | null;
  content: string | null;
  referrer: string | null;
  landingPage: string | null;
  capturedAt: string;
};

export type AttributionStore = {
  firstTouch: Attribution | null;
  lastTouch: Attribution | null;
};

const STORAGE_KEY = "formivo:attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Search engines and social platforms are classified so reports read sensibly. */
const REFERRER_SOURCES: { pattern: RegExp; source: string; medium: string }[] = [
  { pattern: /(^|\.)google\./i, source: "google", medium: "organic" },
  { pattern: /(^|\.)bing\.com$/i, source: "bing", medium: "organic" },
  { pattern: /(^|\.)duckduckgo\.com$/i, source: "duckduckgo", medium: "organic" },
  { pattern: /(^|\.)yandex\./i, source: "yandex", medium: "organic" },
  { pattern: /chatgpt\.com$|chat\.openai\.com$/i, source: "chatgpt", medium: "ai" },
  { pattern: /perplexity\.ai$/i, source: "perplexity", medium: "ai" },
  { pattern: /claude\.ai$/i, source: "claude", medium: "ai" },
  { pattern: /(^|\.)x\.com$|(^|\.)twitter\.com$/i, source: "x", medium: "social" },
  { pattern: /(^|\.)linkedin\.com$/i, source: "linkedin", medium: "social" },
  { pattern: /(^|\.)reddit\.com$/i, source: "reddit", medium: "social" },
  { pattern: /(^|\.)news\.ycombinator\.com$/i, source: "hackernews", medium: "social" },
  { pattern: /(^|\.)producthunt\.com$/i, source: "producthunt", medium: "social" },
];

function classifyReferrer(referrer: string | null): {
  source: string | null;
  medium: string | null;
} {
  if (!referrer) return { source: null, medium: null };
  let host: string;
  try {
    host = new URL(referrer).hostname;
  } catch {
    return { source: null, medium: null };
  }
  if (host === window.location.hostname) return { source: null, medium: null };

  const known = REFERRER_SOURCES.find((entry) => entry.pattern.test(host));
  if (known) return { source: known.source, medium: known.medium };
  return { source: host, medium: "referral" };
}

export function buildAttribution(url: URL, referrer: string | null): Attribution {
  const params = url.searchParams;
  const utm = Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key)?.slice(0, 120) ?? null]),
  ) as Record<(typeof UTM_KEYS)[number], string | null>;

  const classified = classifyReferrer(referrer);
  const hasUtm = Boolean(utm.utm_source || utm.utm_medium || utm.utm_campaign);

  return {
    source: utm.utm_source ?? classified.source,
    medium: utm.utm_medium ?? (hasUtm ? null : classified.medium),
    campaign: utm.utm_campaign,
    term: utm.utm_term,
    content: utm.utm_content,
    referrer: referrer ? referrer.slice(0, 300) : null,
    landingPage: `${url.pathname}${url.search}`.slice(0, 300),
    capturedAt: new Date().toISOString(),
  };
}

export function readAttribution(): AttributionStore {
  if (typeof window === "undefined") return { firstTouch: null, lastTouch: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { firstTouch: null, lastTouch: null };
    const parsed = JSON.parse(raw) as Partial<AttributionStore>;
    return {
      firstTouch: parsed.firstTouch ?? null,
      lastTouch: parsed.lastTouch ?? null,
    };
  } catch {
    return { firstTouch: null, lastTouch: null };
  }
}

function writeAttribution(store: AttributionStore): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage may be disabled (private mode, quota). Attribution is best effort.
  }
}

/**
 * Records the current visit. The first touch is written once and never replaced; the
 * last touch is replaced only when the visit carries a new, identifiable source.
 */
export function captureAttribution(): AttributionStore {
  if (typeof window === "undefined") return { firstTouch: null, lastTouch: null };

  const current = readAttribution();
  const next = buildAttribution(new URL(window.location.href), document.referrer || null);
  const hasSignal = Boolean(next.source || next.medium || next.campaign);

  const store: AttributionStore = {
    firstTouch: current.firstTouch ?? (hasSignal ? next : null),
    lastTouch: hasSignal ? next : current.lastTouch,
  };

  if (store.firstTouch !== current.firstTouch || store.lastTouch !== current.lastTouch) {
    writeAttribution(store);
  }
  return store;
}

/** Attribution as a compact object for GA4 event params and PostHog person properties. */
export function attributionProperties(store: AttributionStore): Record<string, string> {
  const touch = store.lastTouch ?? store.firstTouch;
  if (!touch) return {};

  const properties: Record<string, string> = {};
  if (touch.source) properties.traffic_source = touch.source;
  if (touch.medium) properties.traffic_medium = touch.medium;
  if (touch.campaign) properties.traffic_campaign = touch.campaign;
  if (touch.content) properties.traffic_content = touch.content;
  if (touch.term) properties.traffic_term = touch.term;
  if (touch.landingPage) properties.landing_page = touch.landingPage;
  return properties;
}
