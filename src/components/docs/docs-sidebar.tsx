"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { DOCS_NAV } from "@/config/docs";
import { cn } from "@/lib/utils/cn";

/**
 * Documentation navigation with an inline filter. Search runs over the titles and
 * descriptions in the config, so it can never point at a page that does not exist.
 */
export function DocsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return DOCS_NAV;
    return DOCS_NAV.map((group) => ({
      ...group,
      pages: group.pages.filter(
        (page) =>
          page.title.toLowerCase().includes(term) || page.description.toLowerCase().includes(term),
      ),
    })).filter((group) => group.pages.length > 0);
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <label className="relative block">
        <span className="sr-only">Search documentation</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search docs"
          className="h-9 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:outline-none"
        />
      </label>

      <nav aria-label="Documentation" className="flex flex-col gap-6">
        {groups.length === 0 ? (
          <p className="text-sm text-foreground-muted">No page matches that search.</p>
        ) : null}

        {groups.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.pages.map((page) => {
                const active = pathname === page.href;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-2.5 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-accent-subtle font-medium text-accent"
                          : "text-foreground-secondary hover:bg-surface-muted hover:text-foreground",
                      )}
                    >
                      {page.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
