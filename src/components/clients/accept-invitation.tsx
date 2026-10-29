"use client";

import { useActionState } from "react";

import { acceptInvitationAction, type AcceptState } from "@/app/invite/[token]/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: AcceptState = {};

export function AcceptInvitation({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvitationAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      <Button type="submit" loading={pending} loadingText="Connecting access…">
        Accept invitation
      </Button>
    </form>
  );
}
