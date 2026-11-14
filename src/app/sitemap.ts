import type { MetadataRoute } from "next";

import { alternatives } from "@/content/alternatives";
import { blogCategories, blogPosts } from "@/content/blog";
import { comparisons } from "@/content/comparisons";
import { guides } from "@/content/guides";
import { integrations } from "@/content/integrations";
import { solutions } from "@/content/solutions";
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
    // Category archives are indexable, so they belong in the sitemap with the date of
    // their newest article.
    ...blogCategories.map((category) => {
      const newest = blogPosts
        .filter((post) => post.category === category)
        .map((post) => post.updatedAt ?? post.publishedAt)
        .sort()
        .at(-1);
      return {
        url: canonicalUrl(`/blog/category/${category.toLowerCase()}`),
        ...(newest ? { lastModified: `${newest}T00:00:00Z` } : {}),
      };
    }),
    ...guides.map((guide) => ({ url: canonicalUrl(`/guides/${guide.slug}`) })),
    ...alternatives.map((item) => ({
      url: canonicalUrl(`/alternatives/${item.slug}`),
      lastModified: `${item.verifiedOn}T00:00:00Z`,
    })),
    ...comparisons.map((item) => ({ url: canonicalUrl(`/compare/${item.slug}`) })),
    ...solutions.map((item) => ({ url: canonicalUrl(`/solutions/${item.slug}`) })),
    ...integrations.map((item) => ({ url: canonicalUrl(`/integrations/${item.slug}`) })),
    // Documentation pages come from the same config that builds the sidebar, so a new
    // page is always indexable.
    // `/docs` is already in SITEMAP_PATHS; only the child pages are added here.
    ...DOCS_FLAT.filter((page) => page.href !== "/docs").map((page) => ({
      url: canonicalUrl(page.href),
    })),
  ];

  return [...staticPages, ...contentPages];
}
