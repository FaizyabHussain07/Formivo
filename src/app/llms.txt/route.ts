import { canonicalUrl, SITE_URL } from "@/lib/seo";

/**
 * Optional machine-readable index for AI assistants and answer engines. It links only to
 * real, public pages and never contains credentials or user data.
 */
const CONTENT = `# Formivo

> Formivo is a developer-first form backend. Create a form, copy its public endpoint, point an existing website at it, and manage the resulting submissions in a dashboard. Public form submissions require no API key or secret; security comes from server-side validation, rate limits, plan quotas, and workspace authorization for reading data.

## Product

- [Homepage](${canonicalUrl("/")}): Product overview, how it works, features, security model and FAQ.
- [Pricing](${canonicalUrl("/pricing")}): Free, Pro and Agency plans with limits for forms, submissions and client viewers.
- [Contact](${canonicalUrl("/contact")}): Support, sales and security contact channels.

## Documentation

- [Documentation](${canonicalUrl("/docs")}): Endpoint reference, quickstart, request formats, responses, status codes, rate limits, CORS, and the security model.

## Legal

- [Privacy policy](${canonicalUrl("/privacy")}): Data collected, subprocessors, retention and user rights.
- [Terms of service](${canonicalUrl("/terms")}): Acceptable use, plan limits, billing and data ownership.

## API summary

- Endpoint: POST ${SITE_URL}/api/f/{formId}
- Content types: application/json, application/x-www-form-urlencoded, multipart/form-data
- Success: 200 (HTML thank-you page) or 201 with a JSON body containing success, leadId and message
- Errors: 400 invalid payload, 404 unknown form, 409 paused form or quota reached, 413 body too large, 415 unsupported content type, 429 rate limited with Retry-After, 405 for reads
- Authentication: none for submissions; reading submissions requires a signed-in workspace member
`;

export function GET() {
  return new Response(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
