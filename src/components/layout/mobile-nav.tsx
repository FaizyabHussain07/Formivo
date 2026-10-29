"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useState, type ReactNode } from "react";

import type { NavGroup, NavItem } from "@/config/navigation";

import { NavLink } from "./nav-link";

type MobileNavProps = {
  items: NavItem[];
  groups?: NavGroup[];
  label: string;
  exactHrefs?: string[];
  footer?: ReactNode;
};

export function MobileNav({ items, groups, label, exactHrefs = [], footer }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const sections: NavGroup[] = groups ?? [{ label, items }];

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground-secondary transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        {open ? (
          <X className="size-4" aria-hidden="true" />
        ) : (
          <Menu className="size-4" aria-hidden="true" />
        )}
        <span className="sr-only">{open ? `Close ${label}` : `Open ${label}`}</span>
      </button>
      <nav
        id={panelId}
        aria-label={label}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-b border-border bg-surface px-4 py-4 shadow-lg"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          {sections.map((section) => (
            <div key={section.label} className="flex flex-col gap-1">
              <p className="px-3 text-[10px] font-semibold tracking-[0.14em] text-foreground-muted uppercase">
                {section.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      variant="side"
                      exact={exactHrefs.includes(item.href)}
                      onNavigate={() => setOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {footer ? <div className="border-t border-border pt-3">{footer}</div> : null}
      </nav>
    </div>
  );
}
