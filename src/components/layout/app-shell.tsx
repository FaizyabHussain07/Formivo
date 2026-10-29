import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { NavGroup, NavItem } from "@/config/navigation";
import { Badge } from "@/components/ui/badge";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";

type AppShellProps = {
  nav: NavItem[];
  groups?: NavGroup[];
  navLabel: string;
  contextLabel: string;
  homeHref: string;
  exactHrefs?: string[];
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * Authenticated application frame: a persistent sidebar on desktop and a sheet
 * menu below `lg`. Follows the global light/dark theme rather than forcing one.
 */
export function AppShell({
  nav,
  groups,
  navLabel,
  contextLabel,
  homeHref,
  exactHrefs = [],
  footer,
  children,
}: AppShellProps) {
  const sections: NavGroup[] = groups ?? [{ label: navLabel, items: nav }];

  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Logo href={homeHref} />
          <Badge tone="accent" className="ml-0.5">
            {contextLabel}
          </Badge>
        </div>

        <nav aria-label={navLabel} className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col gap-1">
              <p className="px-3 pb-1 text-[10px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                {section.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} variant="side" exact={exactHrefs.includes(item.href)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-3 border-t border-border p-3">
          {footer}
          <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-muted/60 px-3 py-2">
            <span className="text-xs text-foreground-muted">Appearance</span>
            <ThemeToggle className="size-8 border-transparent bg-transparent hover:bg-surface" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <div className="flex min-w-0 items-center gap-2">
            <Logo href={homeHref} />
            <Badge>{contextLabel}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav items={nav} groups={groups} label={navLabel} exactHrefs={exactHrefs} />
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
