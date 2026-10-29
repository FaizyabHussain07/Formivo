"use client";

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

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
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
