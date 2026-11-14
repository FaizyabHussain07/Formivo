import Link from "next/link";

import type { LimitEnforcement } from "@/lib/billing/form-limit";

/**
 * Explains a plan limit in place instead of failing silently.
 *
 * `enforceActiveFormLimit` pauses the forms that are over the allowance, so this notice
 * names them and points at the upgrade path. No form or submission is deleted.
 */
export function PlanLimitNotice({
  enforcement,
  blocked,
}: {
  enforcement: LimitEnforcement;
  blocked?: boolean;
}) {
  if (enforcement.withinLimit && !blocked) return null;

  const pausedCount = enforcement.paused.length;
  const upgradeLabel = `Upgrade to Pro`;

  return (
    <section
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-foreground">
          {blocked
            ? `${enforcement.planName} allows ${enforcement.allowed} active ${
                enforcement.allowed === 1 ? "form" : "forms"
              }`
            : `${pausedCount} ${pausedCount === 1 ? "form was" : "forms were"} paused by your plan limit`}
        </p>
        <p className="text-[13px] leading-6 text-foreground-secondary">
          {blocked
            ? "Pause another form first, or upgrade to keep them all live at the same time."
            : `Your ${enforcement.planName} plan keeps ${enforcement.allowed} active ${
                enforcement.allowed === 1 ? "form" : "forms"
              } at a time. The extra forms are paused, not deleted: every submission is kept, and you can swap which form is live${
                pausedCount > 0
                  ? ` (paused: ${enforcement.paused
                      .slice(0, 3)
                      .map((form) => form.name)
                      .join(", ")}${pausedCount > 3 ? `, +${pausedCount - 3} more` : ""})`
                  : ""
              }.`
          }
        </p>
      </div>
      <Link
        href="/billing"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent px-3.5 py-2 text-[13px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        {upgradeLabel}
      </Link>
    </section>
  );
}
