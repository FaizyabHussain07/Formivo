import type { MetadataRoute } from "next";

import { DISALLOWED_PATHS, SITE_URL } from "@/lib/seo";

/**
 * Public marketing and documentation stay crawlable; every authenticated or
 * application route is disallowed. Robots is a crawling hint, not access control —
 * those same routes enforce authentication and ship `noindex` themselves.
 */
/**
 * Answer engines and search crawlers are listed explicitly. Listing them does not
 * grant them anything a wildcard would not, but it removes ambiguity for operators
 * who check whether a site opted in, and the `/llms.txt` files give them a clean
 * summary without crawling the whole marketing site.
 */
const ANSWER_ENGINE_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Google-Extended",
  "Bingbot",
  "Applebot-Extended",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS,
      },
      ...ANSWER_ENGINE_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOWED_PATHS,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
