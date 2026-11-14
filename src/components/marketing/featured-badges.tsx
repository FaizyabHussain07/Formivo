import { ArrowUpRight } from "lucide-react";

import { directories, type DirectoryListing } from "@/config/directories";
import { cn } from "@/lib/utils/cn";

/**
 * "Featured on" badges.
 *
 * Plain <img> rather than next/image: these are third-party SVGs served by each
 * directory's own CDN, already sized by the provider, and re-encoding them would change
 * the badge each directory asks you to display unchanged.
 */
function Badge({ item }: { item: DirectoryListing }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex flex-col items-start gap-1.5"
      aria-label={`${item.name} — ${item.note}`}
    >
      {item.badge ? (
        // eslint-disable-next-line @next/next/no-img-element -- official third-party badge SVG
        <img
          src={item.badge.src}
          alt={item.badge.alt}
          width={item.badge.width}
          height={item.badge.height}
          loading="lazy"
          className="h-[54px] w-auto max-w-[250px] opacity-90 transition-opacity group-hover:opacity-100"
        />
      ) : (
        <span className="inline-flex h-[54px] items-center gap-1 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors group-hover:border-border-strong">
          {item.name}
          <ArrowUpRight className="size-3.5 text-foreground-muted" aria-hidden="true" />
        </span>
      )}
      <span className="text-[11px] text-foreground-muted">{item.note}</span>
    </a>
  );
}

export function FeaturedBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-5",
        compact ? "gap-x-5 gap-y-4" : "gap-x-8 gap-y-6",
      )}
    >
      {directories.map((item) => (
        <Badge key={item.name} item={item} />
      ))}
    </div>
  );
}
