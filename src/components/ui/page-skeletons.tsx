import { cn } from "@/lib/utils/cn";

import { Skeleton, SkeletonText } from "./skeleton";

/**
 * Route-level loading views.
 *
 * Each skeleton mirrors the shape of the page it replaces — header, stats,
 * table, article body — so a slow segment streams into a layout that does not
 * jump. They are server components: no client JavaScript is shipped for a
 * placeholder that only exists for a few hundred milliseconds.
 */

function LoadingAnnouncement({ label }: { label: string }) {
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {label}
    </span>
  );
}

function HeaderSkeleton({ withActions = true }: { withActions?: boolean }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-56 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {withActions ? (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      ) : null}
    </div>
  );
}

/** Dashboard-style page: header, KPI row, optional chart, data table. */
export function AppPageSkeleton({
  stats = 4,
  rows = 6,
  chart = false,
  label = "Loading page",
}: {
  stats?: number;
  rows?: number;
  chart?: boolean;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <LoadingAnnouncement label={label} />
      <HeaderSkeleton />
      <div
        className={cn(
          "grid gap-4",
          stats === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {Array.from({ length: stats }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
            <Skeleton className="mt-3 h-3 w-28" />
          </div>
        ))}
      </div>
      {chart ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-5 h-48 w-full" />
        </div>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="ml-auto hidden h-3.5 w-24 sm:block" />
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Card grid view used by the forms and clients listings. */
export function CardGridSkeleton({
  cards = 6,
  label = "Loading page",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <LoadingAnnouncement label={label} />
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-4/5" />
            <Skeleton className="mt-5 h-8 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Settings / billing forms: two columns of labelled fields. */
export function FormPageSkeleton({ label = "Loading page" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <LoadingAnnouncement label={label} />
      <HeaderSkeleton withActions={false} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-6">
          <Skeleton className="h-4 w-36" />
          <div className="mt-6 flex flex-col gap-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-9 w-32" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border bg-surface p-6">
              <Skeleton className="h-4 w-28" />
              <SkeletonText className="mt-4" lines={3} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Long-form article / docs / comparison page. */
export function ArticleSkeleton({ label = "Loading article" }: { label?: string }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-14" aria-busy="true">
      <LoadingAnnouncement label={label} />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex flex-col gap-6">
        <SkeletonText lines={4} />
        <Skeleton className="h-5 w-48" />
        <SkeletonText lines={5} />
        <Skeleton className="h-48 w-full rounded-xl" />
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}

/** Index pages: blog, guides and comparisons list cards under a page title. */
export function ContentListSkeleton({
  cards = 6,
  label = "Loading page",
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8" aria-busy="true">
      <LoadingAnnouncement label={label} />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <SkeletonText lines={2} className="max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-4/5" />
            <SkeletonText lines={3} />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Sign-in and sign-up: a centred card while the session check resolves. */
export function AuthSkeleton({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16" aria-busy="true">
      <LoadingAnnouncement label={label} />
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">
        <Skeleton className="size-9 rounded-lg" />
        <Skeleton className="mt-5 h-6 w-48" />
        <Skeleton className="mt-2 h-3.5 w-full" />
        <div className="mt-7 flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="mt-2 h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Marketing page shell: hero, feature grid, closing call to action. */
export function MarketingSkeleton({ label = "Loading page" }: { label?: string }) {
  return (
    <div className="flex flex-col" aria-busy="true">
      <LoadingAnnouncement label={label} />
      <div className="border-b border-border">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-44 rounded-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-4/5" />
            <SkeletonText lines={2} className="mt-2" />
            <div className="mt-4 flex gap-3">
              <Skeleton className="h-11 w-36 rounded-lg" />
              <Skeleton className="h-11 w-40 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="mt-4 h-4 w-36" />
            <SkeletonText className="mt-3" lines={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
