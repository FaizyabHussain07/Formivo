import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-semibold tracking-tight",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-7 items-center justify-center rounded-md bg-foreground font-mono text-sm text-background"
      >
        F
      </span>
      <span>{siteConfig.name}</span>
    </Link>
  );
}
