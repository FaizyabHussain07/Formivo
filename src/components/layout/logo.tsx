import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";

/**
 * Primary horizontal logo: real symbol + wordmark (brand identity §14.1).
 * The image is decorative; the link's accessible name comes from the wordmark.
 */
export function Logo({
  href = "/",
  className,
  onClick,
}: {
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}
    >
      <Image
        src="/formivo-logo.png"
        alt=""
        aria-hidden="true"
        width={28}
        height={28}
        priority
        className="size-7 shrink-0"
      />
      <span>{siteConfig.name}</span>
    </Link>
  );
}
