import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";

export function apiSuccess<T extends Record<string, unknown>>(
  body: T,
  status = 200,
  headers?: HeadersInit,
) {
  return NextResponse.json({ success: true, ...body }, { status, headers });
}

export function apiError(error: AppError) {
  const headers: Record<string, string> = {};
  if (error.code === "RATE_LIMITED") headers["Retry-After"] = "60";

  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    },
    { status: error.status, headers },
  );
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError("INTERNAL_ERROR");
}

/** Best-effort client IP from proxy headers (used only for rate-limit bucketing). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
