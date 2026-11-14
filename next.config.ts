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
  // Paddle.js is loaded from the CDN and opens the overlay in an iframe.
  "https://cdn.paddle.com",
  "https://sandbox-cdn.paddle.com",
].join(" ");

const analyticsConnectOrigins = [
  "https://datafa.st",
  "https://*.paddle.com",
  "https://paddle.com",
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
  "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://i.ytimg.com https://api.producthunt.com https://www.uneed.best https://peerpush.com https://img.turbo0.com https://twelve.tools https://startupfa.me https://fazier.com https://www.sideprojectors.com https://awesomeindie.com",
  "font-src 'self' data:",
  // The founder walkthrough and the Paddle checkout overlay are the only third-party
  // frames on the site.
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://*.paddle.com",
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
  "/verify",
  "/checkout",
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
  async redirects() {
    // Stable aliases for documentation URLs that appear in guides, articles and
    // external links. They point at pages that exist rather than a 404.
    return [
      { source: "/docs/getting-started", destination: "/docs/quickstart", permanent: true },
      { source: "/docs/create-a-form", destination: "/docs/quickstart", permanent: true },
      { source: "/docs/connect-a-form", destination: "/docs/html", permanent: true },
      { source: "/docs/manage-submissions", destination: "/docs/submissions", permanent: true },
      { source: "/docs/client-access", destination: "/docs/client-portal", permanent: true },
      { source: "/docs/submission-limits", destination: "/docs/submissions", permanent: true },
      { source: "/docs/export-data", destination: "/docs/submissions", permanent: true },
      { source: "/integrations/php", destination: "/guides/php", permanent: true },
      { source: "/integrations/laravel", destination: "/guides/laravel", permanent: true },
      { source: "/integrations/vue", destination: "/guides/vue", permanent: true },
      { source: "/integrations/python", destination: "/guides/python", permanent: true },
      { source: "/insights", destination: "/blog", permanent: true },
    ];
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
