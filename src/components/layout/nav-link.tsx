"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";

import { navIcons } from "./nav-icons";

export function isActivePath(pathname: string, href: string, exact = false): boolean {
  if (exact || href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinkProps = {
  item: NavItem;
  variant?: "top" | "side";
  exact?: boolean;
  onNavigate?: () => void;
};

export function NavLink({ item, variant = "top", exact, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href, exact);
  const Icon = item.icon ? navIcons[item.icon] : undefined;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md text-sm transition-colors",
        variant === "top" &&
          "px-3 py-2 text-foreground-secondary hover:text-foreground aria-[current=page]:font-medium aria-[current=page]:text-foreground",
        variant === "side" &&
          "flex items-center gap-3 px-3 py-2 text-foreground-secondary hover:bg-surface-muted hover:text-foreground aria-[current=page]:bg-accent-subtle aria-[current=page]:font-medium aria-[current=page]:text-accent-hover",
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden="true" /> : null}
      {item.label}
    </Link>
  );
}
