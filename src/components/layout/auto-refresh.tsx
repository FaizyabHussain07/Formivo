"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps authenticated dashboards close to real time without a websocket: re-fetches the
 * server components on an interval, on tab focus, and when the tab becomes visible.
 * Refreshes are skipped while the user is typing, has a dialog open, or the tab is hidden
 * so forms in progress are never disturbed.
 */
export function AutoRefresh({ intervalMs = 12_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
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
