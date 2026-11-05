import { sortedPosts } from "@/content/blog";
import { canonicalUrl } from "@/lib/seo";

/**
 * RSS 2.0 feed for the blog. It reads only build-time content, so it is
 * rendered once and cached, giving aggregators a stable source.
 */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const items = sortedPosts
    .map((post) => {
      const url = canonicalUrl(`/blog/${post.slug}`);
      const date = new Date(`${post.publishedAt}T09:00:00Z`).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Formivo blog</title>
    <link>${canonicalUrl("/blog")}</link>
    <atom:link href="${canonicalUrl("/blog/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>Writing on form backends, integrations, spam control and client hand-off.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
