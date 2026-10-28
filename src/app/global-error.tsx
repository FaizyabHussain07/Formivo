"use client";

import "./globals.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
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
            onClick={() => retry()}
            className="mt-6 h-10 rounded-md border border-border bg-surface px-4 text-sm font-medium hover:bg-surface-muted"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
