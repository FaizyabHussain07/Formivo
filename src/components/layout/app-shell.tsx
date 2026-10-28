import type { ReactNode } from "react";

import type { NavItem } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

type AppShellProps = {
  nav: NavItem[];
  navLabel: string;
  contextLabel: string;
  homeHref: string;
  exactHrefs?: string[];
  children: ReactNode;
};

/** Authenticated application frame: persistent sidebar on desktop, collapsible menu below `lg`. */
export function AppShell({
  nav,
  navLabel,
  contextLabel,
  homeHref,
  exactHrefs = [],
  children,
}: AppShellProps) {
  return (
    <div
      data-theme="dark"
      className="flex min-h-full flex-1 flex-col bg-background text-foreground lg:flex-row"
    >
      <header className="relative flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Logo href={homeHref} />
          <Badge>{contextLabel}</Badge>
        </div>
        <MobileNav items={nav} label={navLabel} exactHrefs={exactHrefs} />
      </header>

      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Logo href={homeHref} />
          <Badge>{contextLabel}</Badge>
        </div>
        <nav aria-label={navLabel} className="flex-1 p-3">
          <ul className="flex flex-col gap-0.5">
            {nav.map((item) => (
              <li key={item.href}>
                <NavLink item={item} variant="side" exact={exactHrefs.includes(item.href)} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">{children}</div>
      </main>
    </div>
  );
}
