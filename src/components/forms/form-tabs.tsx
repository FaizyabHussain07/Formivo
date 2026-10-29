"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export function FormTabs({ tabs }: { tabs: { href: string; label: string; exact?: boolean }[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Form sections" className="overflow-x-auto">
      <ul className="flex min-w-max gap-1 border-b border-border">
        {tabs.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-accent text-foreground"
                    : "border-transparent text-foreground-secondary hover:border-border hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
