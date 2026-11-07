"use client";

import posthog from "posthog-js";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps authenticated dashboards close to real time without a websocket: re-fetches the
 * server components on an interval, on tab focus, and when the tab becomes visible.
 * Refreshes are skipped while the user is typing, has a dialog open, or the tab is hidden
 * so forms in progress are never disturbed.
 */
type IdentifiedUser = {
  id: string;
  email?: string;
  displayName?: string;
  role?: "client" | "developer";
};

const posthogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export function AutoRefresh({
  intervalMs = 12_000,
  user,
}: {
  intervalMs?: number;
  user?: IdentifiedUser;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!posthogConfigured || !user) return;

    posthog.identify(user.id, {
      ...(user.email ? { email: user.email } : {}),
      ...(user.displayName ? { name: user.displayName } : {}),
      ...(user.role ? { role: user.role } : {}),
    });
  }, [user]);

  useEffect(() => {
    function resetPostHogOnSignOut(event: SubmitEvent) {
      if (
        event.defaultPrevented ||
        !(event.target instanceof HTMLFormElement) ||
        event.target.dataset.posthogReset !== "true" ||
        !posthogConfigured
      ) {
        return;
      }
      posthog.reset();
    }

    document.addEventListener("submit", resetPostHogOnSignOut);
    return () => document.removeEventListener("submit", resetPostHogOnSignOut);
  }, []);

  useEffect(() => {
    if (intervalMs <= 0) return;
    function isEditing() {
      const element = document.activeElement;
      if (!element) return false;
      const tag = element.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (element as HTMLElement).isContentEditable
      );
    }

    function refreshIfSafe() {
      if (document.visibilityState !== "visible") return;
      if (isEditing()) return;
      if (document.querySelector("dialog[open]")) return;
      router.refresh();
    }

    const timer = window.setInterval(refreshIfSafe, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshIfSafe();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [intervalMs, router]);

  return null;
}
