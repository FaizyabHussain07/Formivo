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
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface p-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
          <p className="truncate text-[11px] text-foreground-muted">{email}</p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="inline-flex size-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="sr-only">Sign out</span>
          </button>
        </form>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
        <span className="truncate text-[11px] text-foreground-muted">{context}</span>
        {badge ? <Badge tone="accent">{badge}</Badge> : null}
      </div>
    </div>
  );
}

export function AppPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl bg-surface-muted" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-surface-muted" />
    </div>
  );
}
