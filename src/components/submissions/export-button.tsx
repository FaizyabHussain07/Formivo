"use client";

import { Download, Lock } from "lucide-react";
import Link from "next/link";

import { track } from "@/lib/analytics/client";

/**
 * CSV export entry point. Free workspaces get an upsell instead of a dead button;
 * the server refuses the request either way, so this is presentation only.
 */
export function ExportButton({
  href,
  canExport,
  className = "",
}: {
  href: string;
  canExport: boolean;
  className?: string;
}) {
  const base =
    "inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-colors";

  if (!canExport) {
    return (
      <Link
        href="/pricing#plans"
        className={`${base} border-border bg-surface text-foreground-muted hover:bg-surface-muted ${className}`}
        title="CSV export is available on the Light, Pro and Agency plans."
      >
        <Lock className="size-4" aria-hidden="true" />
        Export CSV
        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          Paid
        </span>
      </Link>
    );
  }

  return (
    <a
      href={href}
      download
      onClick={() => track("export_submissions")}
      className={`${base} border-border bg-surface text-foreground shadow-[0_1px_2px_rgb(11_31_28/0.04)] hover:bg-surface-muted ${className}`}
    >
      <Download className="size-4" aria-hidden="true" />
      Export CSV
    </a>
  );
}
