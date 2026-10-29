"use client";

import { useActionState, useRef, useState } from "react";

import { rotateSecretAction, type FormActionState } from "@/app/(developer)/forms/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

import { SecretReveal } from "./secret-reveal";

const initialState: FormActionState = {};

export function RotateSecret({ formId }: { formId: string }) {
  const [state, formAction, pending] = useActionState(rotateSecretAction, initialState);
  const [confirming, setConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-4">
      {state.error ? <Alert tone="error" title={state.error} /> : null}
      {state.secret ? (
        <SecretReveal secret={state.secret} />
      ) : (
        <p className="text-sm text-foreground-secondary">
          Rotating immediately invalidates the current secret. Your website must be updated with
          the new value before submissions can succeed.
        </p>
      )}

      <form ref={formRef} action={formAction}>
        <input type="hidden" name="formId" value={formId} />
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConfirming(true)}
          disabled={Boolean(state.secret)}
        >
          Rotate secret
        </Button>
      </form>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Rotate the form secret?"
        description="The current secret stops working immediately. Sites still using it will receive 401 errors."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={pending}
              loadingText="Rotating…"
              onClick={() => {
                setConfirming(false);
                formRef.current?.requestSubmit();
              }}
            >
              Rotate secret
            </Button>
          </>
        }
      />
    </div>
  );
}
