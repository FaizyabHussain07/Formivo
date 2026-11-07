"use client";

import { useEffect } from "react";

import { identifyUser } from "@/lib/analytics/client";

/**
 * Associates later events with the signed-in account using the internal user id only.
 * Mounted by the authenticated shells, so marketing pages stay anonymous.
 */
export function IdentifyUser({ userId, role }: { userId: string; role: string }) {
  useEffect(() => {
    identifyUser(userId, { role });
  }, [userId, role]);

  return null;
}
