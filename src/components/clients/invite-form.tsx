"use client";

import { useActionState } from "react";

import { inviteClientAction, type InviteState } from "@/app/(developer)/clients/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";

const initialState: InviteState = {};

export function InviteClientForm({
  forms,
  fixedFormId,
}: {
  forms: { id: string; name: string }[];
  fixedFormId?: string;
}) {
  const [state, formAction, pending] = useActionState(inviteClientAction, initialState);

  if (forms.length === 0) {
    return (
      <Alert tone="info" title="Create a form first">
        Client access is granted per form. Create a form, then invite a client to view it.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.success ? (
        <Alert tone={state.emailSent ? "success" : "warning"} title={state.success}>
          {state.inviteUrl ? (
            <div className="mt-2 flex flex-col gap-2">
              <code className="overflow-x-auto rounded-md border border-border bg-surface-muted p-2 font-mono text-xs break-all">
                {state.inviteUrl}
              </code>
              <CopyButton value={state.inviteUrl} label="Copy invitation link" />
            </div>
          ) : null}
        </Alert>
      ) : null}

      {fixedFormId ? (
        <input type="hidden" name="formId" value={fixedFormId} />
      ) : (
        <Field label="Form" required>
          {(control) => (
            <Select {...control} name="formId" required defaultValue={forms[0]?.id}>
              {forms.map((form) => (
                <option key={form.id} value={form.id}>
                  {form.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}

      <Field
        label="Client email"
        helperText="They receive a single-use invitation link. Access is read-only and can be revoked at any time."
        required
      >
        {(control) => (
          <Input
            {...control}
            name="email"
            type="email"
            placeholder="client@example.com"
            defaultValue={state.invitedEmail}
            required
          />
        )}
      </Field>

      <div>
        <Button type="submit" loading={pending} loadingText="Creating invitation…">
          Send invitation
        </Button>
      </div>
    </form>
  );
}
