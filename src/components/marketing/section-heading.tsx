import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
  className,
  titleClassName,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <span className="eyebrow">{eyebrow}</span>
      <div
        className={cn(
          "flex w-full flex-col gap-4",
          align === "center" ? "items-center" : "sm:flex-row sm:items-end sm:justify-between",
        )}
      >
        <h2
          className={cn(
            "max-w-2xl text-3xl leading-[1.12] font-semibold tracking-[-0.022em] text-balance text-foreground sm:text-4xl lg:text-[2.65rem]",
            titleClassName,
          )}
        >
          {title}
        </h2>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-[15px] leading-7 text-foreground-secondary sm:text-base",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
