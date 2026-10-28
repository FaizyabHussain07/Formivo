import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-surface-muted">
          <Icon className="size-5 text-foreground-muted" aria-hidden="true" />
        </div>
      ) : null}
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description ? (
        <div className="mt-1 max-w-md text-sm text-foreground-secondary">{description}</div>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
