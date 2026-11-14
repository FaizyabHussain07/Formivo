import { directories } from "@/config/directories";

/**
 * One-line, continuously scrolling strip of the real directory badges.
 *
 * The list is rendered twice and the track is translated by exactly half its width, so
 * the loop is seamless with no JavaScript and no layout shift. Hovering pauses it, and
 * `prefers-reduced-motion` stops the animation entirely (the strip is still readable
 * because the first copy stays in place).
 */
export function FeaturedBadgesMarquee() {
  const row = (key: string, duplicated = false) => (
    <ul
      key={key}
      aria-hidden={duplicated ? "true" : undefined}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {directories.map((item) => (
        <li key={`${key}-${item.name}`} className="shrink-0">
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.name} — ${item.note}`}
            className="group/badge inline-flex items-center opacity-80 transition-opacity hover:opacity-100"
          >
            {item.badge ? (
              // eslint-disable-next-line @next/next/no-img-element -- official third-party badge asset
              <img
                src={item.badge.src}
                alt={item.badge.alt}
                width={item.badge.width}
                height={item.badge.height}
                loading="lazy"
                className="h-8 w-auto max-w-[180px] object-contain"
              />
            ) : (
              <span className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-[11px] font-medium whitespace-nowrap text-foreground-secondary">
                {item.name}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="group relative overflow-hidden border-b border-border bg-surface-muted/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent"
      />
      <div className="flex w-max items-center py-4 animate-[badge-marquee_55s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row("primary")}
        {row("duplicate", true)}
      </div>
    </div>
  );
}
