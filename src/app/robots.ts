import type { MetadataRoute } from "next";

import { DISALLOWED_PATHS, SITE_URL } from "@/lib/seo";

/**
 * Public marketing and documentation stay crawlable; every authenticated or
 * application route is disallowed. Robots is a crawling hint, not access control —
 * those same routes enforce authentication and ship `noindex` themselves.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
