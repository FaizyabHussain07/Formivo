"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useActionState } from "react";

import { createFormAction, type FormActionState } from "@/app/(developer)/forms/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";

const initialState: FormActionState = {};

export function CreateForm() {
  const [state, formAction, pending] = useActionState(createFormAction, initialState);

  function captureFormCreation() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("form_creation_requested");
    }
  }

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-col gap-5"
      noValidate
      onSubmit={captureFormCreation}
    >
      {state.error ? <Alert tone="error" title={state.error} /> : null}

      <Field
        label="Form name"
        helperText="Internal name, e.g. “Website contact form”."
        error={state.fieldErrors?.name}
        required
      >
        {(control) => (
          <Input
            {...control}
            name="name"
            placeholder="Website contact form"
            maxLength={120}
            required
          />
        )}
      </Field>

      <Field label="Description" error={state.fieldErrors?.description}>
        {(control) => (
          <Textarea
            {...control}
            name="description"
            rows={3}
            maxLength={2000}
            placeholder="Where this form lives and what it collects."
          />
        )}
      </Field>

      <Field
        label="Notification email"
        helperText="Optional. Where you want to hear about new submissions (not sent automatically yet)."
        error={state.fieldErrors?.notificationEmail}
      >
        {(control) => (
          <Input {...control} name="notificationEmail" type="email" placeholder="you@company.com" />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending} loadingText="Creating form…">
          Create form
        </Button>
        <Link href="/forms" className="text-sm text-foreground-secondary hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  );
}
