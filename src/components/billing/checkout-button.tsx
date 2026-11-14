"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { startCheckoutAction, type BillingState } from "@/app/(developer)/billing/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: BillingState = {};

type PaddleCheckout = {
  open: (options: Record<string, unknown>) => void;
};

type PaddleGlobal = {
  Environment: { set: (environment: "sandbox" | "production") => void };
  Initialize: (options: Record<string, unknown>) => void;
  Checkout: PaddleCheckout;
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

const PADDLE_SCRIPT_ID = "formivo-paddle";
let paddleLoader: Promise<PaddleGlobal | null> | null = null;

/** Loads Paddle.js once and waits for it to be usable, or resolves null if blocked. */
function loadPaddle(): Promise<PaddleGlobal | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (paddleLoader) return paddleLoader;

  paddleLoader = new Promise((resolve) => {
    const existing = document.getElementById(PADDLE_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const done = () => resolve(window.Paddle ?? null);
    script.addEventListener("load", done, { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    if (!existing) {
      script.id = PADDLE_SCRIPT_ID;
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return paddleLoader;
}

export function CheckoutButton({
  plan,
  label,
  disabled,
  disabledLabel,
}: {
  plan: "light" | "pro" | "agency";
  label: string;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(startCheckoutAction, initialState);
  const [clientError, setClientError] = useState<string | null>(null);
  const opened = useRef<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkout = state.checkout;
    if (!checkout || opened.current === checkout.transactionId) return;
    opened.current = checkout.transactionId;

    let cancelled = false;
    void (async () => {
      const paddle = await loadPaddle();
      if (cancelled) return;
      if (!paddle) {
        // The overlay script is blocked (for example by a strict content blocker).
        if (checkout.checkoutUrl) {
          window.location.href = checkout.checkoutUrl;
          return;
        }
        setClientError(
          "The secure checkout could not load in this browser. Disable script blocking and try again.",
        );
        return;
      }

      try {
        paddle.Environment.set(checkout.environment);
        paddle.Initialize({
          token: checkout.clientToken,
          eventCallback: (event: { name?: string }) => {
            // The redirect only refreshes the page. Entitlements change when the
            // signed webhook arrives, never because the browser said so.
            if (event?.name === "checkout.completed") router.refresh();
          },
        });
        paddle.Checkout.open({
          transactionId: checkout.transactionId,
          settings: {
            displayMode: "overlay",
            theme: "light",
            allowLogout: false,
            successUrl: `${window.location.origin}/billing?checkout=success`,
          },
        });
      } catch {
        if (checkout.checkoutUrl) window.location.href = checkout.checkoutUrl;
        else setClientError("The secure checkout could not be opened. Please try again.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.checkout, router]);

  const error = state.error ?? clientError;

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="plan" value={plan} />
      <Button type="submit" disabled={disabled} loading={pending} loadingText="Opening checkout…">
        {disabled ? (disabledLabel ?? "Unavailable") : label}
      </Button>
      {error ? <Alert tone="error" title={error} /> : null}
      {state.notice ? <Alert tone="info" title={state.notice} /> : null}
    </form>
  );
}
