"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  requestPasswordResetAction,
  updatePasswordAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.notice ? (
        <Alert tone="success" title="Check your inbox">
          {state.notice}
        </Alert>
      ) : null}

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

      <Button type="submit" loading={pending} loadingText="Sending…" className="w-full">
        Send reset link
      </Button>

      <p className="text-sm text-foreground-secondary">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error ? <Alert tone="error" title={state.error} /> : null}

      <Field label="New password" helperText="At least 8 characters." required>
        {(control) => (
          <Input
            {...control}
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>

      <Field label="Confirm new password" required>
        {(control) => (
          <Input
            {...control}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>

      <Button type="submit" loading={pending} loadingText="Saving…" className="w-full">
        Set new password
      </Button>
    </form>
  );
}
