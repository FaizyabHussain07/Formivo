import type { MetadataRoute } from "next";

import { SITEMAP_PATHS, canonicalUrl } from "@/lib/seo";

/**
 * Only canonical, public, indexable routes. Authentication, dashboard, invitation and
 * API routes are excluded, and no last-modified date is emitted because the build has
 * no reliable per-page publication date.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_PATHS.map((path) => ({ url: canonicalUrl(path) }));
}
