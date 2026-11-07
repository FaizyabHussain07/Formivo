"use client";

import { useActionState } from "react";

import { adminLoginAction, type AdminLoginState } from "@/app/admin/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: AdminLoginState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLoginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.error ? <Alert tone="error" title={state.error} /> : null}

      <Field label="Admin username" required>
        {(control) => (
          <Input
            {...control}
            name="username"
            autoComplete="username"
            spellCheck={false}
            autoCapitalize="none"
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

      <Button type="submit" loading={pending} loadingText="Checking…" className="w-full">
        Sign in to admin
      </Button>
    </form>
  );
}
