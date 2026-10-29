import { siteConfig } from "@/config/site";

/**
 * Canonical origin for every indexable URL. It is a build-time constant on purpose:
 * canonicals, Open Graph URLs, sitemaps and structured data must never depend on the
 * runtime deployment host (preview domains, localhost, etc.).
 */
export const SITE_URL = siteConfig.productionUrl;

/** Absolute canonical URL for a public page. `/` is the only route without a segment. */
export function canonicalUrl(path = "/"): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/** Robots rules: public marketing and docs are open, application routes are closed. */
const PRIVATE_PREFIXES = [
  "/dashboard",
  "/forms",
  "/submissions",
  "/analytics",
  "/clients",
  "/billing",
  "/settings",
  "/client",
  "/invite",
  "/api",
  "/auth",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
] as const;

export const DISALLOWED_PATHS: string[] = [...PRIVATE_PREFIXES];

export const SITEMAP_PATHS = ["/", "/docs", "/pricing", "/contact", "/privacy", "/terms"] as const;
