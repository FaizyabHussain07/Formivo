import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export const controlStyles =
  "w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70 aria-invalid:border-error aria-invalid:focus-visible:outline-error";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return <input type={type} className={cn(controlStyles, "h-10", className)} {...props} />;
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<"textarea">) {
  return <textarea rows={rows} className={cn(controlStyles, "py-2", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlStyles, "h-10 pr-8", className)} {...props} />;
}
