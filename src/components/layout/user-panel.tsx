import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/(auth)/actions";
import { Badge } from "@/components/ui/badge";

export function UserPanel({
  name,
  email,
  context,
  badge,
}: {
  name: string;
  email: string;
  context: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-subtle text-sm font-semibold text-accent"
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-foreground-muted">{email}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-xs text-foreground-secondary">{context}</span>
          {badge ? <Badge tone="accent">{badge}</Badge> : null}
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-sm px-1.5 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AppPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-48 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-surface-muted" />
      <div className="h-64 animate-pulse rounded-lg bg-surface-muted" />
    </div>
  );
}
