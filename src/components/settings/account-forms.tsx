"use client";

import { useActionState } from "react";

import {
  changePasswordAction,
  updateProfileAction,
  type AccountState,
} from "@/app/account-actions";
import {
  updateWorkspaceAction,
  type WorkspaceState,
} from "@/app/(developer)/settings/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialAccountState: AccountState = {};
const initialWorkspaceState: WorkspaceState = {};

export function ProfileForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialAccountState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.success ? <Alert tone="success" title={state.success} /> : null}

      <Field label="Display name" error={state.fieldErrors?.displayName} required>
        {(control) => (
          <Input
            {...control}
            name="displayName"
            defaultValue={initialName}
            maxLength={100}
            required
          />
        )}
      </Field>

      <div>
        <Button type="submit" loading={pending} loadingText="Saving…">
          Save profile
        </Button>
      </div>
    </form>
  );
}

export function WorkspaceForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(updateWorkspaceAction, initialWorkspaceState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.success ? <Alert tone="success" title={state.success} /> : null}

      <Field
        label="Workspace name"
        helperText="Shown in invitation emails and on shared client pages."
        error={state.fieldErrors?.name}
        required
      >
        {(control) => (
          <Input {...control} name="name" defaultValue={initialName} maxLength={80} required />
        )}
      </Field>

      <div>
        <Button type="submit" loading={pending} loadingText="Saving…">
          Save workspace
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialAccountState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.success ? <Alert tone="success" title={state.success} /> : null}

      <Field label="Current password" error={state.fieldErrors?.currentPassword} required>
        {(control) => (
          <Input
            {...control}
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        )}
      </Field>

      <Field
        label="New password"
        helperText="At least 8 characters."
        error={state.fieldErrors?.newPassword}
        required
      >
        {(control) => (
          <Input
            {...control}
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        )}
      </Field>

      <Field label="Confirm new password" error={state.fieldErrors?.confirmPassword} required>
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

      <div>
        <Button type="submit" loading={pending} loadingText="Updating…">
          Update password
        </Button>
      </div>
    </form>
  );
}
