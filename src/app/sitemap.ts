import type { MetadataRoute } from "next";

import { alternatives } from "@/content/alternatives";
import { blogPosts } from "@/content/blog";
import { guides } from "@/content/guides";
import { DOCS_FLAT } from "@/config/docs";
import { SITEMAP_PATHS, canonicalUrl } from "@/lib/seo";

/**
 * Only canonical, public, indexable routes. Authentication, dashboard, invitation and
 * API routes are excluded. Content pages carry their real publication/update date so
 * crawlers can prioritise fresh articles without guessing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = SITEMAP_PATHS.map((path) => ({
    url: canonicalUrl(path),
  }));

  const contentPages: MetadataRoute.Sitemap = [
    ...blogPosts.map((post) => ({
      url: canonicalUrl(`/blog/${post.slug}`),
      lastModified: `${post.updatedAt ?? post.publishedAt}T00:00:00Z`,
    })),
    ...guides.map((guide) => ({ url: canonicalUrl(`/guides/${guide.slug}`) })),
    ...alternatives.map((item) => ({
      url: canonicalUrl(`/alternatives/${item.slug}`),
      lastModified: `${item.verifiedOn}T00:00:00Z`,
    })),
    // Documentation pages come from the same config that builds the sidebar, so a new
    // page is always indexable.
    // `/docs` is already in SITEMAP_PATHS; only the child pages are added here.
    ...DOCS_FLAT.filter((page) => page.href !== "/docs").map((page) => ({
      url: canonicalUrl(page.href),
    })),
  ];

  return [...staticPages, ...contentPages];
}
