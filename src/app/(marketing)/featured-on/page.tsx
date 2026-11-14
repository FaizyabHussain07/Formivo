import type { Metadata } from "next";
import Link from "next/link";

import { FeaturedBadges } from "@/components/marketing/featured-badges";
import { Container } from "@/components/ui/container";
import { directories } from "@/config/directories";
import { socialImage } from "@/lib/seo";

const title = "Formivo on launch directories";
const description =
  "Every live directory listing for Formivo: Product Hunt, DevHunt, Uneed, PeerPush, Turbo0, Twelve Tools, Startup Fame, Fazier, SideProjectors, Awesome Indie, Peerlist, TinyLaunch and StackShare.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/featured-on" },
  keywords: ["formivo product hunt", "formivo devhunt", "formivo uneed", "formivo peerlist"],
  openGraph: {
    title,
    description,
    images: [socialImage({ title, subtitle: description, kind: "product" })],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage({ title, subtitle: description })],
  },
};

export default function FeaturedOnPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border">
        <Container className="flex flex-col gap-4 py-14">
          <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
            Featured on
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
            Where Formivo is listed.
          </h1>
          <p className="max-w-2xl text-[15px] leading-7 text-foreground-secondary">
            Every directory below is a live listing, linked to its real page. Nothing here is a
            placeholder or a paid endorsement: these are launch and product directories where
            Formivo was submitted and accepted.
          </p>
        </Container>
      </section>

      <Container className="flex flex-col gap-10 py-12">
        <FeaturedBadges />

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">All listings</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {directories.map((item) => (
              <li key={item.name} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <span className="text-xs text-foreground-muted">{item.note}</span>
                </div>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Open listing
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm leading-6 text-foreground-secondary">
          Want to compare Formivo with another tool first? Start with{" "}
          <Link href="/compare" className="text-accent hover:underline">
            the comparisons
          </Link>{" "}
          or{" "}
          <Link href="/pricing" className="text-accent hover:underline">
            the pricing page
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
