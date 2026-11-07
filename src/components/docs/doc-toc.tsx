"use client";

import { useEffect, useState } from "react";

type Heading = { id: string; text: string };

/**
 * On-page navigation built from the rendered `h2` elements, so it always matches the
 * page instead of a hand-maintained list that drifts. The active entry follows scroll.
 */
export function DocToc() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Reading the rendered DOM is an external-system read, so it happens after paint
    // instead of during the effect body.
    const frame = window.requestAnimationFrame(() => {
      // Each DocSection owns the anchor id and holds one h2, so the section is the
      // scroll target and its heading supplies the label.
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-doc-content] section[id]"),
      );
      setHeadings(
        sections.flatMap((section) => {
          const label = section.querySelector("h2")?.textContent?.trim();
          return label ? [{ id: section.id, text: label }] : [];
        }),
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: [0, 1] },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
        On this page
      </p>
      <ul className="flex flex-col gap-1 border-l border-border">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={
                heading.id === activeId
                  ? "-ml-px block border-l-2 border-accent pl-3 text-sm text-accent"
                  : "-ml-px block border-l-2 border-transparent pl-3 text-sm text-foreground-muted transition-colors hover:text-foreground"
              }
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
