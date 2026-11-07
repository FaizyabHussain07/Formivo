import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy.
 *
 * Next.js streams inline bootstrap scripts and Tailwind emits inline styles, so
 * `'unsafe-inline'` is required for those two directives until a nonce pipeline is
 * added. Everything that can be locked down is: no eval in production, no framing,
 * no plugins, no arbitrary third-party origins. Only the analytics providers this app
 * actually loads are allowed, plus Supabase Auth for REST and the realtime websocket.
 */
const analyticsScriptOrigins = [
  "https://datafa.st",
  "https://www.googletagmanager.com",
  "https://us.i.posthog.com",
  "https://us-assets.i.posthog.com",
].join(" ");

const analyticsConnectOrigins = [
  "https://datafa.st",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
  "https://us.i.posthog.com",
  "https://us-assets.i.posthog.com",
].join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  isProduction
    ? `script-src 'self' 'unsafe-inline' ${analyticsScriptOrigins}`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${analyticsScriptOrigins}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co ${analyticsConnectOrigins}`,
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/** Authenticated application areas: never cacheable by a shared cache or browser. */
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
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/api/session",
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      ...PRIVATE_PREFIXES.map((prefix) => ({
        source: `${prefix}/:path*`,
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      })),
      ...PRIVATE_PREFIXES.filter((prefix) => !prefix.startsWith("/api/")).map((prefix) => ({
        source: prefix,
        headers: [{ key: "Cache-Control", value: "private, no-store, max-age=0" }],
      })),
    ];
  },
};

export default nextConfig;
