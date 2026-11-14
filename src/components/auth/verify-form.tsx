"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  resendVerificationAction,
  verifyEmailOtpAction,
  type VerifyState,
} from "@/app/(auth)/verify/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: VerifyState = {};
const CODE_LENGTH = 6;

export function VerifyForm({ email, next }: { email: string; next: string }) {
  const [state, formAction, pending] = useActionState(verifyEmailOtpAction, initialState);
  const [resendState, resendAction, resending] = useActionState(
    resendVerificationAction,
    initialState,
  );
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [editingEmail, setEditingEmail] = useState(!email);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [cooldown, setCooldown] = useState(60);

  // Resend availability counts down instead of allowing an unlimited retry loop.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function updateDigit(index: number, value: string) {
    const numeric = value.replace(/\D/g, "");
    if (!numeric) {
      setDigits((current) => current.map((digit, i) => (i === index ? "" : digit)));
      return;
    }
    // Pasting a full code fills every box at once.
    if (numeric.length > 1) {
      const nextDigits = numeric.slice(0, CODE_LENGTH).split("");
      setDigits((current) =>
        current.map((digit, i) => (nextDigits[i] !== undefined ? nextDigits[i] : digit)),
      );
      inputs.current[Math.min(nextDigits.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    setDigits((current) => current.map((digit, i) => (i === index ? numeric : digit)));
    if (index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  const token = digits.join("");

  if (editingEmail) {
    return (
      <form action="/verify" method="get" className="flex flex-col gap-4">
        <Field label="Email address" required>
          {(control) => (
            <Input
              {...control}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={email}
              placeholder="you@company.com"
              required
            />
          )}
        </Field>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" className="w-full">
          Send my code
        </Button>
        <p className="text-sm text-foreground-secondary">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-foreground-secondary">
        Code sent to <span className="font-medium text-foreground">{email}</span>
      </p>

      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {resendState.error ? <Alert tone="error" title={resendState.error} /> : null}
      {resendState.notice ? (
        <Alert tone="success" title="New code sent">
          {resendState.notice}
        </Alert>
      ) : null}

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="token" value={token} />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Six-digit code</legend>
          <div className="flex gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputs.current[index] = element;
                }}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(index, event)}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={CODE_LENGTH}
                aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                className="h-12 w-11 rounded-lg border border-border bg-surface text-center font-mono text-lg font-semibold text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 sm:w-12"
                // The first box takes focus so desktop users can type immediately.
                autoFocus={index === 0}
              />
            ))}
          </div>
          <p className="text-xs text-foreground-muted">Paste the whole code into the first box.</p>
        </fieldset>

        <Button type="submit" loading={pending} loadingText="Verifying…" className="w-full">
          Verify email
        </Button>
      </form>

      <form
        action={resendAction}
        onSubmit={() => setCooldown(resendState.cooldown ?? 60)}
        className="flex flex-col gap-3 border-t border-border pt-4"
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-foreground-muted">
            {cooldown > 0
              ? `You can request another code in ${cooldown}s.`
              : "Did not get the email? Check spam, then request another code."}
          </p>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={resending}
            loadingText="Sending…"
            disabled={cooldown > 0 || resending}
          >
            Resend code
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setEditingEmail(true)}
          className="text-foreground-secondary underline-offset-2 hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
        <span aria-hidden="true" className="text-border-strong">
          ·
        </span>
        <Link href="/login" className="text-foreground-secondary hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
