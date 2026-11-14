import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { SITE_URL, canonicalUrl } from "@/lib/seo";

/**
 * JSON-LD for structured data. Values are escaped so user-controlled strings can never
 * break out of the script element, and every field mirrors content that is visible on
 * the page. No invented ratings, counts or reviews.
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
    image: `${SITE_URL}/og-image.jpg`,
    email: "faizyabdev@gmail.com",
    description:
      "A developer-first form backend and lead management platform for freelancers and web agencies managing client websites.",
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Formivo",
    url: canonicalUrl("/"),
    inLanguage: "en",
    description: "Form backend and submission management for developers, freelancers and agencies.",
  };
}

/** Offers mirror src/lib/billing/plans.ts exactly, never a separate hardcoded price. */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Formivo",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Form backend",
    operatingSystem: "Web",
    url: canonicalUrl("/"),
    description:
      "Connect an existing website form to one public endpoint, collect submissions, manage leads across client projects, and give each client a read-only portal.",
    featureList: [
      "One public form endpoint per form",
      "Validated, rate-limited submission intake",
      "Searchable submissions and lead statuses",
      "Per-form read-only client access",
      "CSV export on paid plans",
    ],
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
