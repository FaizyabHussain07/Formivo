"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";

/** Signed-in developers get a Dashboard shortcut instead of two auth links. */
export function HeaderActions({ signedIn }: { signedIn: boolean }) {
  if (signedIn) {
    return (
      <ButtonLink href="/dashboard" size="sm">
        Dashboard
      </ButtonLink>
    );
  }
  return (
    <>
      <Link
        href="/login"
        className="hidden rounded-lg px-3 py-2 text-[13.5px] font-medium text-foreground-secondary transition-colors hover:text-foreground sm:inline-block"
      >
        Log in
      </Link>
      <ButtonLink href="/signup" size="sm">
        Get started
      </ButtonLink>
    </>
  );
}

/**
 * Session state is resolved in the browser from a small no-store endpoint, so the
 * marketing shell stays fully static and prerendering never touches auth state.
 */
export function SessionAwareHeaderActions() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.authenticated) setSignedIn(true);
      })
      .catch(() => {
        // Signed-out state is the safe default.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <HeaderActions signedIn={signedIn} />;
}
