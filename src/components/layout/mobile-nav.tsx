"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

import type { NavItem } from "@/config/navigation";

import { NavLink } from "./nav-link";

type MobileNavProps = {
  items: NavItem[];
  label: string;
  exactHrefs?: string[];
};

export function MobileNav({ items, label, exactHrefs = [] }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className="inline-flex size-10 items-center justify-center rounded-md text-foreground-secondary hover:bg-surface-muted hover:text-foreground"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
        <span className="sr-only">{open ? `Close ${label}` : `Open ${label}`}</span>
      </button>
      <nav
        id={panelId}
        aria-label={label}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-b border-border bg-surface px-4 py-3 shadow-sm"
      >
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
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
      </nav>
    </div>
  );
}
