import { alternatives } from "@/content/alternatives";
import { sortedPosts } from "@/content/blog";
import { guides } from "@/content/guides";
import { canonicalUrl, SITE_URL } from "@/lib/seo";

/**
 * Machine-readable index for AI assistants and answer engines. It links only to real,
 * public pages and never contains credentials or user data. Content lists are generated
 * from the same modules the pages render, so it cannot drift from the site.
 */
function content(): string {
  const posts = sortedPosts
    .map((post) => `- [${post.title}](${canonicalUrl(`/blog/${post.slug}`)}): ${post.description}`)
    .join("\n");

  const guideLines = guides
    .map(
      (guide) =>
        `- [${guide.language}](${canonicalUrl(`/guides/${guide.slug}`)}): ${guide.summary}`,
    )
    .join("\n");

  const alternativeLines = alternatives
    .map(
      (item) =>
        `- [Formivo vs ${item.competitor}](${canonicalUrl(`/alternatives/${item.slug}`)}): ${item.summary} Competitor facts verified ${item.verifiedOn}.`,
    )
    .join("\n");

  return `# Formivo

> Formivo is a developer-first form backend. Create a form, copy its public endpoint, point an existing website at it, and manage the resulting submissions in a dashboard. Public form submissions require no API key or secret; security comes from server-side validation, rate limits, plan quotas, and workspace authorization for reading data.

## Product

- [Homepage](${canonicalUrl("/")}): Product overview, how it works, features, security model and FAQ.
- [Features](${canonicalUrl("/features")}): Every capability with a link to how it works.
- [Pricing](${canonicalUrl("/pricing")}): Free, Pro and Agency plans with form, submission and client-viewer limits.
- [Security](${canonicalUrl("/security")}): The concrete controls behind the public endpoint and client access.
- [About](${canonicalUrl("/about")}): Why the product exists and what it deliberately does not do.
- [Contact](${canonicalUrl("/contact")}): Support, sales and security contact channels.

## Documentation

- [Documentation](${canonicalUrl("/docs")}): Endpoint reference, quickstart, request formats, responses, status codes, rate limits, CORS, and the security model.

## Guides

${guideLines}

## Blog

${posts}

## Alternatives

${alternativeLines}

## Pricing summary

- Free: $0, 3 active forms, 300 submissions per month, 3 client viewers, no CSV export.
- Pro: $19 per month, 10 active forms, 2,000 submissions per month, 10 client viewers, CSV export.
- Agency: $49 per month, 50 active forms, 10,000 submissions per month, 50 client viewers, CSV export.

## API summary

- Endpoint: POST ${SITE_URL}/api/f/{formId}
- Content types: application/json, application/x-www-form-urlencoded, multipart/form-data
- Success: 200 (HTML thank-you page) or 201 with a JSON body containing success, leadId and message
- Errors: 400 invalid payload, 404 unknown form, 409 paused form or quota reached, 413 body too large, 415 unsupported content type, 429 rate limited with Retry-After, 405 for reads
- Authentication: none for submissions; reading submissions requires a signed-in workspace member or an invited client viewer
- Reserved helper fields: _redirect, _gotcha, _honey, _subject, _idempotency_key

## Terminology

- "Form": one endpoint plus its settings, owner and submissions.
- "Client viewer": a client account with read-only access to specific forms.
- "Workspace": the container that owns forms, billing and usage.
- "Submission": one accepted POST, stored with structured data and metadata.
`;
}

export function GET() {
  return new Response(content(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
