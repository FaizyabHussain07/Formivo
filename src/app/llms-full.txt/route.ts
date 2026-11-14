import { alternatives } from "@/content/alternatives";
import { sortedPosts } from "@/content/blog";
import { comparisons } from "@/content/comparisons";
import { guides } from "@/content/guides";
import { solutions } from "@/content/solutions";
import type { ContentBlock } from "@/content/types";
import { canonicalUrl } from "@/lib/seo";

/**
 * Long-form companion to /llms.txt: the full text of every public article and guide,
 * generated from the same content modules the pages render. Nothing private is
 * included. This is exactly what a crawler can already read on the pages.
 */
function renderBlock(block: ContentBlock): string {
  switch (block.type) {
    case "h2":
      return `\n### ${block.text}\n`;
    case "h3":
      return `\n#### ${block.text}\n`;
    case "p":
    case "quote":
      return `${block.text}\n`;
    case "ul":
      return `${block.items.map((item) => `- ${item}`).join("\n")}\n`;
    case "ol":
      return `${block.items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n`;
    case "code":
      return `\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`;
    case "table":
      return `\n| ${block.headers.join(" | ")} |\n| ${block.headers.map(() => "---").join(" | ")} |\n${block.rows
        .map((row) => `| ${row.join(" | ")} |`)
        .join("\n")}\n`;
    case "note":
      return `\n> ${block.title}: ${block.text}\n`;
    default:
      return "";
  }
}

function build(): string {
  const posts = sortedPosts
    .map(
      (post) => `## ${post.title}

URL: ${canonicalUrl(`/blog/${post.slug}`)}
Published: ${post.publishedAt} · ${post.readingMinutes} min read · Category: ${post.category}
Description: ${post.description}

${post.answer}
${post.blocks.map(renderBlock).join("\n")}`,
    )
    .join("\n\n---\n\n");

  const guideText = guides
    .map(
      (guide) => `## ${guide.title} (${guide.language} guide)

URL: ${canonicalUrl(`/guides/${guide.slug}`)}
Description: ${guide.description}

Requirements:
${guide.requirements.map((item) => `- ${item}`).join("\n")}

Steps:
${guide.steps.map((item, index) => `${index + 1}. ${item}`).join("\n")}

\`\`\`
${guide.code}
\`\`\`

Response: ${guide.response}

Troubleshooting:
${guide.troubleshooting.map((entry) => `- ${entry.problem}: ${entry.fix}`).join("\n")}`,
    )
    .join("\n\n---\n\n");

  const alternativeText = alternatives
    .map(
      (item) => `## Formivo vs ${item.competitor}

URL: ${canonicalUrl(`/alternatives/${item.slug}`)}
Competitor facts verified: ${item.verifiedOn} (source: ${item.competitorSource})

${item.summary}

What ${item.competitor} offers:
${item.competitorFacts.map((fact) => `- ${fact}`).join("\n")}

Where Formivo differs:
${item.formivoDifference.map((fact) => `- ${fact}`).join("\n")}

Comparison:
| Dimension | Formivo | ${item.competitor} |
| --- | --- | --- |
${item.comparison.map((row) => `| ${row.dimension} | ${row.formivo} | ${row.competitor} |`).join("\n")}

Choose ${item.competitor} if:
${item.chooseCompetitor.map((fact) => `- ${fact}`).join("\n")}

Choose Formivo if:
${item.chooseFormivo.map((fact) => `- ${fact}`).join("\n")}`,
    )
    .join("\n\n---\n\n");

  const comparisonText = comparisons
    .map(
      (item) => `## Formivo vs ${item.competitor}

URL: ${canonicalUrl(`/compare/${item.slug}`)}
Category: ${item.category}
Competitor source: ${item.competitorUrl}

${item.answer}

| Dimension | Formivo | ${item.competitor} |
| --- | --- | --- |
${item.rows.map((row) => `| ${row.dimension} | ${row.formivo} | ${row.competitor} |`).join("\n")}

Choose ${item.competitor} if:
${item.bestFor.map((fact) => `- ${fact}`).join("\n")}

Choose Formivo if:
${item.formivoFit.map((fact) => `- ${fact}`).join("\n")}

Verify on the provider's site:
${item.verify.map((fact) => `- ${fact}`).join("\n")}`,
    )
    .join("\n\n---\n\n");

  const solutionText = solutions
    .map(
      (item) => `## ${item.title}

URL: ${canonicalUrl(`/solutions/${item.slug}`)}

${item.answer}

Workflow:
${item.workflow.map((step, index) => `${index + 1}. ${step.title}: ${step.body}`).join("\n")}`,
    )
    .join("\n\n---\n\n");

  return `# Formivo: full public content

This file contains the complete text of Formivo's public articles, integration guides and
competitor comparisons. Canonical pages are linked for each section.

## Product definition

Formivo is a form backend for developers and agencies. Each form exposes one public POST endpoint
that accepts JSON, urlencoded and multipart bodies without an API key. Submissions are stored,
validated, rate-limited and quota-enforced, then read in a dashboard by the workspace owner or by
client viewers with per-form read-only access.

${posts}

---

# Integration guides

${guideText}

---

# Alternatives

${alternativeText}

---

# Comparisons

${comparisonText}

---

# Solutions

${solutionText}
`;
}

export function GET() {
  return new Response(build(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
