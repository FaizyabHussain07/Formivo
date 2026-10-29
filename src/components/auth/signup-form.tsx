"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUpAction, type AuthState } from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AuthState = {};

export function SignupForm({ next = "/dashboard" }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.notice ? (
        <Alert tone="success" title="Check your email">
          {state.notice}
        </Alert>
      ) : null}

      <Field
        label="Your name"
        helperText="Used for your workspace name; you can change it later."
        required
      >
        {(control) => (
          <Input
            {...control}
            name="displayName"
            autoComplete="name"
            defaultValue={state.values?.displayName}
            placeholder="Ada Lovelace"
            required
          />
        )}
      </Field>

      <Field label="Work email" required>
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

      <Field label="Password" helperText="At least 8 characters." required>
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

      <Button type="submit" loading={pending} loadingText="Creating account…" className="w-full">
        Create free account
      </Button>

      <p className="text-xs leading-relaxed text-foreground-muted">
        By creating an account you agree to the{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="text-sm text-foreground-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
