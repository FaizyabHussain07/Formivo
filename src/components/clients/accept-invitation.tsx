"use client";

import posthog from "posthog-js";
import { useActionState } from "react";

import { acceptInvitationAction, type AcceptState } from "@/app/invite/[token]/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const initialState: AcceptState = {};

export function AcceptInvitation({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvitationAction, initialState);

  function captureInvitationAcceptance() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.capture("client_invitation_accepted");
    }
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4"
      onSubmit={captureInvitationAcceptance}
    >
      <input type="hidden" name="token" value={token} />
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      <Button type="submit" loading={pending} loadingText="Connecting access…">
        Accept invitation
      </Button>
    </form>
  );
}
