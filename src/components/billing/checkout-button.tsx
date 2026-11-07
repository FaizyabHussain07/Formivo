"use client";

import posthog from "posthog-js";
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

  function captureCheckoutStart() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("checkout_started", { plan });
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-2" onSubmit={captureCheckoutStart}>
      <input type="hidden" name="plan" value={plan} />
      <Button type="submit" disabled={disabled} loading={pending} loadingText="Opening checkout…">
        {disabled ? (disabledLabel ?? "Unavailable") : label}
      </Button>
      {state.error ? <Alert tone="error" title={state.error} /> : null}
    </form>
  );
}
