"use client";

import { useEffect } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function GlobalRouteError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : undefined;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 items-center focus:outline-none">
      <Container className="max-w-lg py-24">
        <Alert tone="error" title="Something went wrong">
          An unexpected error occurred. Try again, and contact support if it continues.
          {digest ? <p className="mt-2 font-mono text-xs">Reference: {digest}</p> : null}
        </Alert>
        <Button className="mt-6" variant="secondary" onClick={() => retry()}>
          Try again
        </Button>
      </Container>
    </main>
  );
}
