import type { MetadataRoute } from "next";

import { alternatives } from "@/content/alternatives";
import { blogPosts } from "@/content/blog";
import { guides } from "@/content/guides";
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
  ];

  return [...staticPages, ...contentPages];
}
