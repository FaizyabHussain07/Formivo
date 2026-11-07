"use client";

import posthog from "posthog-js";
import { useActionState } from "react";

import { updateFormAction, type FormActionState } from "@/app/(developer)/forms/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";

const initialState: FormActionState = {};

export function FormSettings({
  formId,
  name,
  description,
  notificationEmail,
}: {
  formId: string;
  name: string;
  description: string | null;
  notificationEmail: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateFormAction, initialState);

  function captureFormSettingsUpdate() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("form_settings_update_requested", { form_id: formId });
    }
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5"
      noValidate
      onSubmit={captureFormSettingsUpdate}
    >
      <input type="hidden" name="formId" value={formId} />
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.success ? <Alert tone="success" title={state.success} /> : null}

      <Field label="Form name" error={state.fieldErrors?.name} required>
        {(control) => (
          <Input {...control} name="name" defaultValue={name} maxLength={120} required />
        )}
      </Field>

      <Field label="Description" error={state.fieldErrors?.description}>
        {(control) => (
          <Textarea
            {...control}
            name="description"
            rows={3}
            maxLength={2000}
            defaultValue={description ?? ""}
          />
        )}
      </Field>

      <Field label="Notification email" error={state.fieldErrors?.notificationEmail}>
        {(control) => (
          <Input
            {...control}
            name="notificationEmail"
            type="email"
            defaultValue={notificationEmail ?? ""}
            placeholder="you@company.com"
          />
        )}
      </Field>

      <div>
        <Button type="submit" loading={pending} loadingText="Saving…">
          Save changes
        </Button>
      </div>
    </form>
  );
}
