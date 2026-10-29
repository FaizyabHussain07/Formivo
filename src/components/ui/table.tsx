import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(11_31_28/0.04)]">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead className={cn("border-b border-border bg-surface-muted/60", className)} {...props} />
  );
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("align-top transition-colors hover:bg-surface-muted/50", className)}
      {...props}
    />
  );
}

export function TableHeaderCell({ className, scope = "col", ...props }: ComponentProps<"th">) {
  return (
    <th
      scope={scope}
      className={cn(
        "px-4 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-foreground-muted uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3.5 text-foreground-secondary", className)} {...props} />;
}
