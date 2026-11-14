import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/content/breadcrumbs";
import { Faq, faqItems } from "@/components/marketing/faq";
import { JsonLd, faqPageSchema } from "@/components/marketing/structured-data";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { canonicalUrl } from "@/lib/seo";
import { siteConfig } from "@/config/site";

const title = "Formivo FAQ: Forms, Leads, Client Access and Billing";
const description =
  "Direct answers about Formivo: how the form endpoint works, who can read submissions, client access, plan limits, exports, cancellation, verification and integrations.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/faq" },
  openGraph: {
    title,
    description,
    url: canonicalUrl("/faq"),
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={faqPageSchema(faqItems)} />
      <Breadcrumbs items={[{ href: "/faq", label: "FAQ" }]} />
      <Container className="flex flex-col gap-8 py-12 lg:py-16">
        <PageHeader
          eyebrow="FAQ"
          title="Questions, answered with what the product actually does."
          description="Including the parts that do not exist yet. If an answer does not settle it, email us; a person replies."
        />
        <Faq />
        <p className="text-sm text-foreground-secondary">
          Still unsure?{" "}
          <Link href="/contact" className="font-medium text-accent hover:underline">
            Contact the team
          </Link>{" "}
          or email{" "}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-accent hover:underline"
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </Container>
    </>
  );
}
