import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Formivo collects, how form submissions and account data are stored, which subprocessors are involved, and how to request deletion of your data.",
  alternates: { canonical: "/privacy" },
};

const sections: { heading: string; paragraphs: string[]; bullets?: string[] }[] = [
  {
    heading: "What we collect",
    paragraphs: [
      "Formivo is a form backend. The data we handle falls into three groups: your account details, the form submissions you receive, and basic operational logs.",
    ],
    bullets: [
      "Account details: your email address and the display name you choose when creating a workspace.",
      "Submissions: the field contents visitors send to your form endpoints — names, emails, messages and whatever else your form collects.",
      "Operational data: request timestamps, approximate request origin, rate-limit counters and error logs used to keep the service working.",
    ],
  },
  {
    heading: "How we use it",
    paragraphs: [
      "Submissions are stored so you and the client viewers you invite can read them in the dashboard. Account details are used to authenticate you, send transactional email (invitations, confirmations, password resets) and nothing else.",
      "We do not sell personal data, we do not build advertising profiles, and we do not read your submissions to train models.",
    ],
  },
  {
    heading: "Cookies and local storage",
    paragraphs: [
      "Formivo uses a session cookie to keep you signed in; without it, authenticated pages would not work. We store your light/dark theme preference in your browser's local storage. We do not use advertising or cross-site tracking cookies.",
    ],
  },
  {
    heading: "Subprocessors",
    paragraphs: [
      "We rely on a small number of providers to run the service. They only process data on our instructions.",
    ],
    bullets: [
      "Supabase — database and authentication (accounts, workspaces, submissions).",
      "Resend — transactional email such as client invitations and password resets.",
      "Cloudflare — hosting and delivery of this website.",
      "Lemon Squeezy — subscription billing, when a paid plan is active; card details are handled by them and never reach our servers.",
    ],
  },
  {
    heading: "Who can see your data",
    paragraphs: [
      "Your submissions are visible to you and to the client viewers you explicitly invite to a single form. Row Level Security and server-side authorization keep one workspace's data out of another workspace's hands. Public form endpoints can write submissions but can never read them.",
    ],
  },
  {
    heading: "Retention and deletion",
    paragraphs: [
      "Submission data is kept until you delete it or close your account. Deleting a form removes its submissions. Closing your account removes your profile, workspace and stored leads; backups expire on their normal rotation schedule.",
      "We keep minimal audit logs (actions such as invitation or status changes) for security and troubleshooting purposes.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "Traffic is encrypted with HTTPS. Service credentials stay on the server and are never shipped to the browser. Access to data requires an authenticated session, and every query is scoped to the authenticated user's own workspace.",
      "No system is perfect. If you find a problem, email us and we will treat it as a priority.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      "You can export or delete your submissions from the dashboard at any time, and you can request a copy of, or correction to, your account data by email. If you are in a jurisdiction with formal data-protection rights (such as GDPR), we will respond to verified requests within a reasonable period.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "When this policy changes materially, we will update this page and note the revision date below. Continued use after a change means you accept the updated policy.",
    ],
  },
];

export default function Page() {
  return (
    <Container className="flex flex-col gap-8 py-12 lg:py-16">
      <PageHeader
        eyebrow="Legal"
        title="Privacy policy"
        description="What Formivo collects, where it is stored, and what you control. Last updated 29 October 2026."
      />

      <div className="flex flex-col gap-7">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-3xl text-sm leading-relaxed text-foreground-secondary"
              >
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
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Contact</h2>
        <p className="max-w-3xl text-sm text-foreground-secondary">
          Questions about your data? Email{" "}
          <Link
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-accent hover:underline"
          >
            {siteConfig.contactEmail}
          </Link>{" "}
          or see our{" "}
          <Link href="/terms" className="font-medium text-accent hover:underline">
            terms of service
          </Link>
          .
        </p>
      </section>
    </Container>
  );
}
