import { Play } from "lucide-react";

import { JsonLd } from "@/components/marketing/structured-data";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Container } from "@/components/ui/container";
import { ogImageUrl } from "@/lib/seo";

/**
 * Demo video section.
 *
 * `FORMIVO_DEMO_VIDEO_URL` (or its NEXT_PUBLIC equivalent) is the only switch. With a
 * URL the page renders a real, lazy-loaded player with a generated poster and a caption.
 * Without one it renders a designed placeholder that states the video is not recorded
 * yet, rather than a fake player that appears broken.
 */
export function ProductDemo() {
  const videoUrl =
    process.env.NEXT_PUBLIC_FORMIVO_DEMO_VIDEO_URL ?? process.env.FORMIVO_DEMO_VIDEO_URL;
  const poster = ogImageUrl({
    title: "See how Formivo works",
    subtitle: "Connect a form, collect submissions, share one client view",
    kind: "product",
  });

  return (
    <section id="demo" className="scroll-mt-20 border-b border-border bg-surface-muted/30">
      <Container className="flex flex-col gap-8 py-20 sm:py-24">
        <SectionHeading
          eyebrow="Product demo"
          title="See how Formivo works."
          description="From connecting a website form to sharing organized submissions with a client, see the complete workflow."
          titleClassName="max-w-2xl"
        />

        {videoUrl ? (
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "VideoObject",
              name: "See how Formivo works",
              description:
                "A walkthrough of connecting a website form to Formivo, managing the submissions and sharing a read-only client view.",
              thumbnailUrl: [poster],
              uploadDate: "2026-11-14",
              contentUrl: videoUrl,
              embedUrl: videoUrl,
            }}
          />
        ) : null}

        <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
          {videoUrl ? (
            <video
              controls
              preload="none"
              playsInline
              poster={poster}
              className="aspect-video w-full bg-brand-ink"
              aria-label="Formivo product walkthrough"
            >
              <source src={videoUrl} />
              Your browser does not support embedded video. You can open the demo directly.
            </video>
          ) : (
            <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 bg-brand-ink px-6 text-center">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,#2dd4bf_1px,transparent_1px),linear-gradient(to_bottom,#2dd4bf_1px,transparent_1px)] [background-size:44px_44px]"
              />
              <span className="relative flex size-14 items-center justify-center rounded-full border border-brand-mint/40 bg-brand-mint/10 text-brand-mint">
                <Play className="size-6" aria-hidden="true" />
              </span>
              <div className="relative flex flex-col gap-1.5">
                <p className="text-sm font-medium text-white">The walkthrough is being recorded</p>
                <p className="max-w-md text-xs leading-5 text-slate-300">
                  This space is reserved for the product demo. Explore the live workflow below in the
                  meantime, or read the quickstart to connect a form in about five minutes.
                </p>
              </div>
              <div className="relative flex flex-wrap justify-center gap-2 text-[10.5px] text-slate-400">
                {["1. Connect a form", "2. Receive submissions", "3. Share one client view"].map(
                  (step) => (
                    <span key={step} className="rounded-full border border-white/15 px-2.5 py-1">
                      {step}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
          <figcaption className="border-t border-border px-5 py-3 text-xs leading-5 text-foreground-muted">
            A short walkthrough of the real interface: creating a form, receiving a submission, and
            inviting a client to a read-only view of that form. No audio autoplays.
          </figcaption>
        </figure>
      </Container>
    </section>
  );
}
