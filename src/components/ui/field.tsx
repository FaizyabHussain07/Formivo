"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Label } from "./label";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  "aria-required"?: true;
};

type FieldProps = {
  label: ReactNode;
  helperText?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  /** Receives the props that wire the control to its label, helper text, and error. */
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({ label, helperText, error, required, className, children }: FieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = [helperText ? helperId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-error" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </Label>
      {children({
        id,
        "aria-describedby": describedBy || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      {helperText ? (
        <p id={helperId} className="text-sm text-foreground-muted">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
