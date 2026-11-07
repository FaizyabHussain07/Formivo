"use client";

import posthog from "posthog-js";
import { useActionState } from "react";

import { sendTestSubmissionAction, type FormActionState } from "@/app/(developer)/forms/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: FormActionState = {};

export function TestSubmission({ formId }: { formId: string }) {
  const [state, formAction, pending] = useActionState(sendTestSubmissionAction, initialState);

  function captureTestSubmission() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("test_submission_requested", { form_id: formId });
    }
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
      onSubmit={captureTestSubmission}
    >
      <input type="hidden" name="formId" value={formId} />
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.success ? <Alert tone="success" title={state.success} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          {(control) => (
            <Input {...control} name="name" defaultValue="Ada Lovelace" maxLength={120} />
          )}
        </Field>
        <Field label="Email">
          {(control) => (
            <Input {...control} name="email" type="email" defaultValue="ada@example.com" />
          )}
        </Field>
      </div>

      <div>
        <Button type="submit" variant="secondary" loading={pending} loadingText="Sending…">
          Send test submission
        </Button>
      </div>
    </form>
  );
}
