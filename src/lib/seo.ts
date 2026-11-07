import { siteConfig } from "@/config/site";

/**
 * Canonical origin for every indexable URL. It is a build-time constant on purpose:
 * canonicals, Open Graph URLs, sitemaps and structured data must never depend on the
 * runtime deployment host (preview domains, localhost, etc.).
 */
export const SITE_URL = siteConfig.productionUrl;

/** Absolute canonical URL for a public page. No trailing slashes, so the homepage
 * canonical, sitemap entry and social URL are all byte-identical strings. */
export function canonicalUrl(path = "/"): string {
  if (path === "/" || path === "") return SITE_URL;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export type OgKind = "product" | "blog" | "guide" | "comparison" | "docs";

/** Absolute URL of the generated social card for a page. */
export function ogImageUrl({
  title,
  subtitle,
  kind = "product",
}: {
  title: string;
  subtitle?: string;
  kind?: OgKind;
}): string {
  const params = new URLSearchParams({ title, kind });
  if (subtitle) params.set("subtitle", subtitle);
  return `${SITE_URL}/og?${params.toString()}`;
}

/**
 * The hand-made brand card shipped from `public/`. Used for the main share links where a
 * per-page title card adds nothing, and as the site-wide fallback. It is a plain static
 * file on purpose: no query string, no rendering step, so every crawler can fetch it.
 */
export const SITE_SOCIAL_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: "Formivo, forms to leads and leads to clients. A simple form backend for developers and agencies.",
} as const;

/** Ready-made `openGraph.images` / `twitter.images` entry for a page. */
export function socialImage({
  title,
  subtitle,
  kind,
  alt,
}: {
  title: string;
  subtitle?: string;
  kind?: OgKind;
  alt?: string;
}) {
  return {
    url: ogImageUrl({ title, subtitle, kind }),
    width: 1200,
    height: 630,
    alt: alt ?? title,
  };
}

/** Robots rules: public marketing and docs are open, application routes are closed. */
const PRIVATE_PREFIXES = [
  "/admin",
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

export const SITEMAP_PATHS = [
  "/",
  "/features",
  "/guides",
  "/alternatives",
  "/blog",
  "/docs",
  "/pricing",
  "/security",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
] as const;
