import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error";

const tones: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface-muted text-foreground-secondary",
  accent: "border-accent/20 bg-accent-subtle text-accent-hover",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  error: "border-error/20 bg-error/10 text-error",
};

/** Status is always conveyed by the text label; tone is supplementary. */
export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
