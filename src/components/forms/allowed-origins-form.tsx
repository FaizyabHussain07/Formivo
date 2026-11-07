"use client";

import posthog from "posthog-js";
import { useActionState } from "react";

import { updateOriginsAction, type FormActionState } from "@/app/(developer)/forms/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";

const initialState: FormActionState = {};

export function AllowedOriginsForm({
  formId,
  allowedOrigins,
}: {
  formId: string;
  allowedOrigins: string[];
}) {
  const [state, formAction, pending] = useActionState(updateOriginsAction, initialState);

  function captureOriginRestrictionsUpdate() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("origin_restrictions_update_requested", { form_id: formId });
    }
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      noValidate
      onSubmit={captureOriginRestrictionsUpdate}
    >
      <input type="hidden" name="formId" value={formId} />
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.success ? <Alert tone="success" title={state.success} /> : null}

      <Field
        label="Allowed browser origins"
        helperText="Optional. One origin per line, e.g. https://example.com. Leave empty to accept browser submissions from any site. http:// is only accepted for localhost."
        error={state.fieldErrors?.allowedOrigins}
      >
        {(control) => (
          <Textarea
            {...control}
            name="allowedOrigins"
            rows={4}
            defaultValue={allowedOrigins.join("\n")}
            placeholder={"https://example.com\nhttps://www.example.com"}
          />
        )}
      </Field>

      <div>
        <Button type="submit" variant="secondary" loading={pending} loadingText="Saving…">
          Save origin restrictions
        </Button>
      </div>
    </form>
  );
}
