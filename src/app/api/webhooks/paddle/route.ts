import { NextResponse } from "next/server";

import { toAppError } from "@/lib/api/response";
import { processPaddleWebhook } from "@/lib/billing/paddle";

/**
 * Paddle sends `Paddle-Signature`; the raw body is required for the HMAC, so it is read
 * as text before any parsing. Nothing in the response echoes the payload or the secret.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("paddle-signature");
    const result = await processPaddleWebhook({ rawBody, signature });

    return NextResponse.json(
      { received: true, handled: result.handled, duplicate: result.duplicate },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const appError = toAppError(error);
    return NextResponse.json(
      { error: appError.code === "WEBHOOK_INVALID" ? "invalid_webhook" : "webhook_failed" },
      { status: appError.status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
