import type { Metadata } from "next";

import { socialImage } from "@/lib/seo";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: "About Formivo" },
  description:
    "Why Formivo exists: a form backend that treats client access as a first-class feature instead of a shared login or a monthly CSV email.",
  alternates: { canonical: "/about" },
  keywords: ["form backend for agencies","formivo about","client form portal"],
  openGraph: {
    title: "Why Formivo exists",
    description: "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace.",
    images: [socialImage({ title: "Why Formivo exists", subtitle: "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace.", kind: "product" })],
  },
  twitter: {
    card: "summary_large_image",
    title: "Why Formivo exists",
    description: "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace.",
    images: [socialImage({ title: "Why Formivo exists", subtitle: "A form backend built around the part most tools ignore: getting leads to your client without handing over your workspace." })],
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

      <Container className="flex max-w-3xl flex-col gap-6 py-12">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">The gap</h2>
        <p className="text-[15px] leading-7 text-foreground-secondary">
          Freelancers and small agencies ship a site, wire the contact form to an inbox, and then
          spend the next year forwarding emails. When the client asks for “all the leads from
          March”, the honest answer is a mailbox search. When they ask for a login, the only option
          is sharing your own account — which gives them everything.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-foreground">The product</h2>
        <p className="text-[15px] leading-7 text-foreground-secondary">
          Formivo keeps the integration boring — one POST endpoint, no key — and puts the effort
          into what happens after: submissions stored as records, lead statuses, search, exports,
          and client accounts that see exactly one form and nothing else.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-foreground">How it is built</h2>
        <p className="text-[15px] leading-7 text-foreground-secondary">
          Next.js with Postgres and row-level security. Authorization is enforced three times — in
          the UI for clarity, on the server for correctness, and in the database so a mistake in the
          application layer cannot become a data leak. The security model is documented publicly
          rather than summarised in a badge.
        </p>

        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          What it will not do
        </h2>
        <ul className="flex flex-col gap-1 text-[15px] leading-7 text-foreground-secondary">
          <li>• It will not be a form builder — your design system stays yours.</li>
          <li>• It will not accept file uploads, because unscanned uploads are a liability.</li>
          <li>• It will not promise rankings, certifications or benchmarks it cannot evidence.</li>
        </ul>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-foreground">Get in touch</p>
          <p className="text-sm leading-6 text-foreground-secondary">
            Questions, bugs and security reports:{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="text-accent hover:underline">
              {siteConfig.contactEmail}
            </a>
            . Or read{" "}
            <Link href="/blog" className="text-accent hover:underline">
              the blog
            </Link>{" "}
            for the longer explanations.
          </p>
        </div>
      </Container>
    </div>
  );
}
