import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type AlertTone = "info" | "success" | "warning" | "error";

const tones: Record<AlertTone, { className: string; icon: LucideIcon }> = {
  info: { className: "border-border bg-surface text-foreground", icon: Info },
  success: { className: "border-success/30 bg-success/5 text-foreground", icon: CheckCircle2 },
  warning: { className: "border-warning/30 bg-warning/5 text-foreground", icon: AlertTriangle },
  error: { className: "border-error/30 bg-error/5 text-foreground", icon: XCircle },
};

const iconColor: Record<AlertTone, string> = {
  info: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

type AlertProps = {
  tone?: AlertTone;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Errors are announced assertively (role="alert"); other tones politely (role="status"). */
export function Alert({ tone = "info", title, children, className }: AlertProps) {
  const { className: toneClass, icon: Icon } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-4", toneClass, className)}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", iconColor[tone])} aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold">{title}</p>
        {children ? <div className="text-sm text-foreground-secondary">{children}</div> : null}
      </div>
    </div>
  );
}
