"use client";

import { useActionState } from "react";

import { startCheckoutAction, type BillingState } from "@/app/(developer)/billing/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: BillingState = {};

export function CheckoutButton({
  plan,
  label,
  disabled,
  disabledLabel,
}: {
  plan: "pro" | "agency";
  label: string;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(startCheckoutAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="plan" value={plan} />
      <Button type="submit" disabled={disabled} loading={pending} loadingText="Opening checkout…">
        {disabled ? (disabledLabel ?? "Unavailable") : label}
      </Button>
      {state.error ? <Alert tone="error" title={state.error} /> : null}
    </form>
  );
}
