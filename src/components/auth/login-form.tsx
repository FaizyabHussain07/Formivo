"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInAction, type AuthState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AuthState = {};

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: "That sign-in link is incomplete. Request a new one and try again.",
  link_expired: "That link has expired. Request a new email and try again.",
  account_setup: "Your account was confirmed but setup failed. Try signing in again.",
  not_configured: "Authentication is not configured on this deployment.",
};

export function LoginForm({
  next,
  errorCode,
}: {
  next: string;
  errorCode?: string;
}) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const linkError = errorCode ? ERROR_MESSAGES[errorCode] : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {linkError ? <Alert tone="error" title={linkError} /> : null}
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.notice ? <Alert tone="success" title={state.notice} /> : null}

      <input type="hidden" name="next" value={next} />

      <Field label="Email" required>
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            placeholder="you@company.com"
            required
          />
        )}
      </Field>

      <Field label="Password" required>
        {(control) => (
          <Input
            {...control}
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        )}
      </Field>

      <Button type="submit" loading={pending} loadingText="Signing in…" className="w-full">
        Sign in
      </Button>

      <div className="flex flex-col gap-2 text-sm text-foreground-secondary">
        <Link href="/forgot-password" className="font-medium text-accent hover:underline">
          Forgot your password?
        </Link>
        <p>
          New to Formivo?{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
