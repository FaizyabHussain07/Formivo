"use client";

import { useEffect } from "react";

import { track } from "@/lib/analytics/client";
import type { AnalyticsEvent, AnalyticsProperties } from "@/lib/analytics/events";

/**
 * Reports a page-level event once per mount. Used for pages whose meaning is not a
 * navigation, such as the pricing page or a completed form setup screen.
 */
export function TrackView({
  event,
  properties,
}: {
  event: AnalyticsEvent;
  properties?: AnalyticsProperties;
}) {
  useEffect(() => {
    track(event, properties ?? {});
    // The event fires once for the page; properties are static by contract.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
