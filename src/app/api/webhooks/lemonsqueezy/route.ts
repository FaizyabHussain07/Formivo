import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { processLemonsqueezyWebhook } from "@/lib/billing/lemonsqueezy";
import { toAppError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");
    const headerEventId = request.headers.get("x-event-id");
    const eventId =
      headerEventId?.trim() ||
      createHash("sha256").update(rawBody).digest("hex");

    const result = await processLemonsqueezyWebhook({ rawBody, signature, eventId });

    return NextResponse.json(
      { received: true, ...result },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const appError = toAppError(error);
    // Never echo provider payloads or signing details back.
    return NextResponse.json(
      { error: appError.code === "WEBHOOK_INVALID" ? "invalid_webhook" : "webhook_failed" },
      { status: appError.status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
