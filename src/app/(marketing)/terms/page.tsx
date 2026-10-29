import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that govern a Formivo account: acceptable use of the public form endpoint, plan limits, billing, data ownership and termination.",
  alternates: { canonical: "/terms" },
};

const sections: { heading: string; paragraphs: string[]; bullets?: string[] }[] = [
  {
    heading: "The service",
    paragraphs: [
      "Formivo is a form backend: it accepts submissions at a public endpoint you connect to your own website, stores them, and gives you and your invited clients a dashboard to read them. By creating an account you agree to these terms.",
    ],
  },
  {
    heading: "Your account",
    paragraphs: [
      "You are responsible for keeping your login credentials private and for the activity that happens under your account. Tell us promptly if you believe your account has been compromised.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "The submission endpoint is public and is protected by validation, rate limits and plan quotas — not by a secret. Use it fairly:",
    ],
    bullets: [
      "No unsolicited bulk messages, spam campaigns or form flooding, including against other people's endpoints.",
      "No unlawful content, malware, phishing pages or attempts to bypass rate limits and quotas.",
      "No resale or redistribution of the service as a competing form backend.",
      "We may pause an endpoint that is being abused, with notice where practical.",
    ],
  },
  {
    heading: "Your data",
    paragraphs: [
      "The submissions you receive belong to you. You can export or delete them from the dashboard at any time. You keep ownership of the content you submit through your own forms; you grant us only the permission needed to store and display it back to you and your invited clients.",
    ],
  },
  {
    heading: "Plans, limits and billing",
    paragraphs: [
      "Each plan sets a number of active forms, a monthly submission allowance and a number of client viewers. Limits are enforced server-side. If you exceed your allowance, new submissions are rejected until the next period or until you upgrade; existing data always stays.",
      "Paid subscriptions are processed by Lemon Squeezy as the merchant of record. Paid plans renew automatically until cancelled, and cancellation takes effect at the end of the current period. Free plans do not require a card.",
    ],
  },
  {
    heading: "Availability",
    paragraphs: [
      "We work to keep Formivo available, but the service is provided \"as is\" without a guarantee of uninterrupted uptime. Planned maintenance and incidents will be communicated through your account email where possible.",
    ],
  },
  {
    heading: "Service changes",
    paragraphs: [
      "We may improve, add or remove features over time. We may suspend or terminate accounts that break these terms; where it is reasonable to do so, we will give you notice and a chance to export your data first.",
    ],
  },
  {
    heading: "Liability",
    paragraphs: [
      "To the extent permitted by law, Formivo is not liable for indirect or consequential damages, or for lost profits, arising from your use of the service. Our total liability is limited to the amount you paid us in the twelve months before the claim, or $50 if you are on the free plan.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions about these terms, or a request to close your account, can be sent to the address below.",
    ],
  },
];

export default function Page() {
  return (
    <Container className="flex flex-col gap-8 py-12 lg:py-16">
      <PageHeader
        eyebrow="Legal"
        title="Terms of service"
        description="The agreement between you and Formivo when you create an account. Last updated 29 October 2026."
      />

      <div className="flex flex-col gap-7">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-3xl text-sm leading-relaxed text-foreground-secondary">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="flex max-w-3xl flex-col gap-1.5 pl-5 text-sm text-foreground-secondary [&>li]:list-disc">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <section className="flex flex-col gap-2 border-t border-border pt-6">
        <p className="max-w-3xl text-sm text-foreground-secondary">
          Email{" "}
          <Link
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-accent hover:underline"
          >
            {siteConfig.contactEmail}
          </Link>{" "}
          for anything you want to ask — including a copy of your data or account closure. See also
          our <Link href="/privacy" className="font-medium text-accent hover:underline">privacy policy</Link>.
        </p>
      </section>
    </Container>
  );
}
