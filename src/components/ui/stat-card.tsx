import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgb(11_31_28/0.04)] transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-foreground-muted uppercase">{label}</p>
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent-subtle text-accent">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-[28px] leading-none font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-foreground-secondary">{hint}</p> : null}
    </div>
  );
}

export function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const ratio = limit <= 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = ratio >= 80;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-mono text-xs text-foreground-secondary">
          {used.toLocaleString("en-US")} / {limit.toLocaleString("en-US")}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            nearLimit ? "bg-warning" : "bg-accent",
          )}
          style={{ width: `${ratio}%` }}
        />
      </div>
      <p className="text-xs text-foreground-muted">
        {nearLimit
          ? "You are close to your monthly limit. Upgrade before submissions start failing."
          : `${Math.max(0, limit - used).toLocaleString("en-US")} submissions remaining this month.`}
      </p>
    </div>
  );
}
