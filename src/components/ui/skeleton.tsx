import { cn } from "@/lib/utils/cn";

/**
 * Base placeholder. The `.skeleton` class in globals.css owns the shimmer so the
 * animation is defined once, respects the reduced-motion media query and adapts
 * to the active light/dark theme.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-md", className)} />;
}

export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
}: {
  lines?: number;
  className?: string;
  lineClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "skeleton h-3.5 rounded",
            index === lines - 1 ? "w-3/5" : "w-full",
            lineClassName,
          )}
        />
      ))}
    </div>
  );
}
