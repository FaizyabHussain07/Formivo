import { ExternalLink } from "lucide-react";

import { founder } from "@/config/founder";

/**
 * The public launch walkthrough. It is embedded from youtube-nocookie.com with
 * loading="lazy", so the player is only fetched when the section is near the viewport.
 * Nothing autoplays and no cookies are set before the visitor presses play.
 */
export function FounderVideo() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-video w-full bg-brand-ink">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${founder.youtube.id}?rel=0`}
          title={founder.youtube.title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="size-full"
        />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-foreground-muted">
        <span>{founder.youtube.title}</span>
        <a
          href={founder.youtube.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
        >
          Watch on YouTube
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}
