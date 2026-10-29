import { NextResponse } from "next/server";

import { apiError, apiSuccess, clientIp, toAppError } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { ingestSubmission } from "@/lib/submissions/service";

const MAX_BODY_BYTES = 256 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function bearerSecret(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || null;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ formId: string }> },
) {
  try {
    const { formId } = await params;

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new AppError("UNSUPPORTED_MEDIA_TYPE");
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      throw new AppError("PAYLOAD_TOO_LARGE");
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      throw new AppError("PAYLOAD_TOO_LARGE");
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new AppError("INVALID_REQUEST", "The request body is not valid JSON.");
    }

    if (!UUID_PATTERN.test(formId)) throw new AppError("FORM_NOT_FOUND");

    const secret = bearerSecret(request);
    if (!secret) {
      throw new AppError("INVALID_FORM_SECRET", "Missing Authorization: Bearer <form secret>.");
    }

    const idempotencyKey = request.headers.get("idempotency-key");
    if (idempotencyKey && idempotencyKey.length > 255) {
      throw new AppError("INVALID_REQUEST", "The Idempotency-Key header is too long.");
    }

    const bodyRecord =
      typeof payload === "object" && payload !== null
        ? (payload as { metadata?: { page?: unknown; source?: unknown } })
        : null;
    const page =
      typeof bodyRecord?.metadata?.page === "string" ? bodyRecord.metadata.page.slice(0, 512) : null;

    const result = await ingestSubmission({
      formId,
      secret,
      payload,
      idempotencyKey,
      clientIp: clientIp(request),
      sourceOrigin: page ?? request.headers.get("origin"),
    });

    const response = apiSuccess(
      {
        leadId: result.submissionId,
        message: result.replayed ? "Submission already received." : "Submission received.",
      },
      result.replayed ? 200 : 201,
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const appError = toAppError(error);
    const response = apiError(appError);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "METHOD_NOT_ALLOWED",
        message: "Use POST to submit to this endpoint.",
      },
    },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}
