import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { SITE_URL, canonicalUrl } from "@/lib/seo";

/**
 * JSON-LD for structured data. Values are escaped so user-controlled strings can never
 * break out of the script element, and every field mirrors content that is visible on
 * the page — no invented ratings, counts or reviews.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Formivo",
    url: canonicalUrl("/"),
    logo: `${SITE_URL}/formivo-logo.png`,
    image: `${SITE_URL}/og-image.png`,
    email: "team@formivo.faizyab.me",
    description:
      "A developer-first form backend: one public endpoint per form, a dashboard for submissions, and read-only client access.",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Formivo",
    url: canonicalUrl("/"),
    description: "Form backend and submission management for developers and agencies.",
  };
}

/** Offers mirror src/lib/billing/plans.ts exactly — never a separate hardcoded price. */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Formivo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: canonicalUrl("/"),
    description:
      "Create a form, connect your website to its public endpoint, and manage submissions and clients in one dashboard.",
    offers: PLAN_ORDER.map((key) => {
      const plan = PLANS[key];
      return {
        "@type": "Offer",
        name: `${plan.name} plan`,
        price: plan.priceMonthly,
        priceCurrency: "USD",
        description: plan.description,
        url: canonicalUrl("/pricing"),
      };
    }),
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
