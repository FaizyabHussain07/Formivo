import { siteConfig } from "@/config/site";

import { parsePublicEnv, type PublicEnv } from "./schema";

let cached: PublicEnv | undefined;

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "::1"]);

/**
 * Absolute URLs in the product (form endpoints, invitation links, emails, password
 * resets) must always point at the public site. A localhost value — common when a
 * developer forgets to set NEXT_PUBLIC_APP_URL — is replaced with the production origin
 * instead of leaking "http://localhost:3000" into emails and dashboards.
 */
function resolveAppUrl(raw: string | undefined): string {
  if (!raw) return siteConfig.productionUrl;
  try {
    const url = new URL(raw);
    if (LOOPBACK_HOSTS.has(url.hostname)) return siteConfig.productionUrl;
    return raw.replace(/\/+$/, "");
  } catch {
    return siteConfig.productionUrl;
  }
}

/**
 * Client-safe configuration. Each variable is referenced literally so Next.js can inline
 * `NEXT_PUBLIC_*` values into browser bundles at build time.
 */
export function getPublicEnv(): PublicEnv {
  cached ??= {
    ...parsePublicEnv({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }),
    NEXT_PUBLIC_APP_URL: resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  };
  return cached;
}
