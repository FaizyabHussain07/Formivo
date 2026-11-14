import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import { founder } from "@/config/founder";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { socialImage } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "About Formivo and its founder" },
  description:
    "Why Formivo exists, who builds it and what the product does. A form backend and lead workspace for freelance developers and agencies managing client websites.",
  alternates: { canonical: "/about" },
  keywords: ["form backend for agencies", "formivo about", "client form portal"],
  openGraph: {
    title: "About Formivo",
    description:
      "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace.",
    images: [
      socialImage({
        title: "About Formivo",
        subtitle:
          "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace.",
        kind: "product",
      }),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Formivo",
    description:
      "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace.",
    images: [
      socialImage({
        title: "About Formivo",
        subtitle:
          "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace.",
      }),
    ],
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <Container className="flex flex-col gap-4 py-14">
          <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
            About
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Built for the part of form handling nobody finishes.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            Receiving a form submission is easy. Keeping it, letting the right client read it, and
            proving what happened six months later is the part that gets postponed.
          </p>
        </Container>
      </section>

      <Container className="flex max-w-3xl flex-col gap-10 py-12">
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">The gap</h2>
          <p className="text-[15px] leading-7 text-foreground-secondary">
            Freelancers and small agencies ship a site, wire the contact form to an inbox, and then
            spend the next year forwarding emails. When the client asks for &ldquo;all the leads
            from March&rdquo;, the honest answer is a mailbox search. When they ask for a login, the
            only option is sharing your own account, which gives them everything.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">The product</h2>
          <p className="text-[15px] leading-7 text-foreground-secondary">
            Formivo keeps the integration boring: one POST endpoint, no key. The effort goes into
            what happens after. Submissions are stored as records, leads get statuses, search and
            exports work across the workspace, and client accounts see exactly one form and nothing
            else.
          </p>
          <dl className="grid gap-3 rounded-xl border border-border bg-surface p-5 text-sm sm:grid-cols-2">
            {[
              { label: "Product", value: "Form backend and lead workspace" },
              { label: "Built for", value: "Freelance developers and web agencies" },
              { label: "Main workflow", value: "Website form → stored lead → client read-only view" },
              {
                label: "Plans",
                value: PLAN_ORDER.map((key) => `${PLANS[key].name} $${PLANS[key].priceMonthly}`).join(" · "),
              },
              { label: "Billing", value: "Monthly through Paddle, card handled by Paddle" },
              { label: "Hosting", value: "Next.js on Vercel with Supabase Postgres" },
              {
                label: "Not offered",
                value: "Form builder, email notifications, CRM sync, file uploads, custom domains",
              },
              { label: "Contact", value: siteConfig.contactEmail },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5">
                <dt className="text-[11px] font-semibold tracking-[0.1em] text-foreground-muted uppercase">
                  {row.label}
                </dt>
                <dd className="text-foreground-secondary">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="founder" className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Who builds it
          </h2>
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-brand-ink font-mono text-[12px] font-semibold text-brand-mint">
                {founder.initials}
              </span>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold text-foreground">{founder.name}</span>
                <span className="text-xs text-foreground-muted">{founder.role}</span>
              </div>
            </div>
            <p className="text-[15px] leading-7 text-foreground-secondary">
              I am a full-stack developer who builds websites and web applications for clients. The
              work usually ends with a contact form, and the question I kept hearing was the same:
              where do the enquiries go, and who is allowed to read them? Formivo is my answer to
              that. I design it, build it and support it, which is also why the product stays
              deliberately small.
            </p>
            <p className="text-sm leading-6 text-foreground-secondary">
              I work primarily with Next.js, TypeScript, Postgres and Supabase, and I care more about
              authorization that holds under a modified request than about a feature list. Everything
              on the security page is something I can point at in the code.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3 text-sm">
              <a
                href={founder.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:underline"
              >
                faizyab.me
              </a>
              {founder.launchPostUrl ? (
                <a
                  href={founder.launchPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground-secondary hover:text-foreground"
                >
                  Launch post
                </a>
              ) : null}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="text-foreground-secondary hover:text-foreground"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">How it is built</h2>
          <p className="text-[15px] leading-7 text-foreground-secondary">
            Next.js with Postgres and row-level security. Authorization is enforced three times: in
            the UI for clarity, on the server for correctness, and in the database so a mistake in
            the application layer cannot become a data leak. The security model is documented
            publicly rather than summarised in a badge.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What it will not do
          </h2>
          <ul className="flex flex-col gap-1 text-[15px] leading-7 text-foreground-secondary">
            <li>• It will not be a form builder. Your design system stays yours.</li>
            <li>• It will not accept file uploads, because unscanned uploads are a liability.</li>
            <li>• It will not promise rankings, certifications or benchmarks it cannot evidence.</li>
          </ul>
        </section>

        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Talk to a person</h2>
          <p className="text-sm leading-6 text-foreground-secondary">
            Questions, bugs and security reports:{" "}
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="font-medium text-accent hover:underline"
            >
              {siteConfig.contactEmail}
            </a>
            . Or read{" "}
            <Link href="/blog" className="text-accent hover:underline">
              the blog
            </Link>{" "}
            for the longer explanations, and{" "}
            <Link href="/changelog" className="text-accent hover:underline">
              the changelog
            </Link>{" "}
            for what has shipped.
          </p>
        </section>
      </Container>
    </div>
  );
}
