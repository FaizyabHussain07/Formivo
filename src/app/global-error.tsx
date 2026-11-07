"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.captureException(error);
    }
  }, [error]);
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <title>Something went wrong · Formivo</title>
        <main className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-foreground-secondary">
            Formivo failed to load. Try again, and contact support if it continues.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 h-10 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-muted"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
