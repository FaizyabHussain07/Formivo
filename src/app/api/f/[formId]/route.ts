import { NextResponse } from "next/server";

import { apiError, apiSuccess, clientIp, toAppError } from "@/lib/api/response";
import { AppError } from "@/lib/errors";
import { isOriginAllowed, normalizeOrigin } from "@/lib/forms/service";
import { getFormOriginPolicy, ingestSubmission } from "@/lib/submissions/service";
import {
  formEntriesToPayload,
  readHelperField,
  safeRedirectTarget,
} from "@/lib/submissions/validation";

const MAX_BODY_BYTES = 256 * 1024;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ParsedRequest = { payload: Record<string, unknown>; isHtml: boolean };

function corsHeaders(origin: string | null, allowedOrigins: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  if (allowedOrigins.length === 0) {
    headers["Access-Control-Allow-Origin"] = "*";
    return headers;
  }
  const normalized = origin ? normalizeOrigin(origin) : null;
  if (normalized && allowedOrigins.includes(normalized)) {
    headers["Access-Control-Allow-Origin"] = normalized;
    headers["Vary"] = "Origin";
  }
  return headers;
}

function withCors(response: NextResponse, headers: Record<string, string>): NextResponse {
  for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function htmlResponse(
  status: number,
  title: string,
  message: string,
  extra?: string,
): NextResponse {
  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light; }
      body { margin:0; min-height:100vh; display:grid; place-items:center; background:#f8fafc; color:#0f172a; font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; padding:24px; }
      main { max-width:520px; width:100%; border:1px solid #e2e8f0; border-radius:12px; background:#fff; padding:32px; }
      h1 { margin:0 0 8px; font-size:20px; line-height:1.3; }
      p { margin:0; color:#475569; line-height:1.6; font-size:14px; }
      .brand { color:#0f766e; font-weight:700; font-size:14px; margin-bottom:20px; }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">Formivo</div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      ${extra ?? ""}
    </main>
  </body>
</html>`;
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function parseRequest(request: Request): Promise<ParsedRequest> {
  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    throw new AppError("PAYLOAD_TOO_LARGE");
  }

  if (contentType.includes("application/json")) {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      throw new AppError("PAYLOAD_TOO_LARGE");
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new AppError("VALIDATION_ERROR", "The request body must be a JSON object.");
      }
      return { payload: parsed as Record<string, unknown>, isHtml: false };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("INVALID_REQUEST", "The request body is not valid JSON.");
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
      throw new AppError("PAYLOAD_TOO_LARGE");
    }
    const params = new URLSearchParams(raw);
    return { payload: formEntriesToPayload(params.entries()), isHtml: true };
  }

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const entries: [string, string][] = [];
    for (const [key, value] of form.entries()) {
      if (typeof value !== "string") {
        throw new AppError("VALIDATION_ERROR", "File uploads are not supported.");
      }
      entries.push([key, value]);
    }
    return { payload: formEntriesToPayload(entries), isHtml: true };
  }

  throw new AppError("UNSUPPORTED_MEDIA_TYPE");
}

export async function OPTIONS(
  request: Request,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;
  const origin = request.headers.get("origin");

  if (!UUID_PATTERN.test(formId)) {
    return new NextResponse(null, { status: 204 });
  }

  let policy: Awaited<ReturnType<typeof getFormOriginPolicy>> = null;
  try {
    policy = await getFormOriginPolicy(formId);
  } catch {
    return new NextResponse(null, { status: 503 });
  }
  if (!policy) return new NextResponse(null, { status: 204 });

  const allowed = policy.allowedOrigins;
  const originAllowed = isOriginAllowed(origin, allowed);
  const headers = originAllowed ? corsHeaders(origin, allowed) : {};

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Idempotency-Key",
      "Access-Control-Max-Age": "600",
    },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  const origin = request.headers.get("origin");
  const accept = (request.headers.get("accept") ?? "").toLowerCase();

  let cors: Record<string, string> = {};
  try {
    const policy = UUID_PATTERN.test(formId) ? await getFormOriginPolicy(formId) : null;
    if (policy) cors = corsHeaders(origin, policy.allowedOrigins);
  } catch {
    // A policy lookup failure is handled by the pipeline below.
  }

  try {
    if (!UUID_PATTERN.test(formId)) throw new AppError("FORM_NOT_FOUND");

    const parsed = await parseRequest(request);
    const isHtml = parsed.isHtml || accept.includes("text/html");

    // Hidden honeypot fields: answer like a success without storing anything.
    const honeypot =
      readHelperField(parsed.payload, "_gotcha") ?? readHelperField(parsed.payload, "_honey");
    if (honeypot) {
      return withCors(
        isHtml
          ? htmlResponse(200, "Thanks — your message was received.", "We will be in touch soon.")
          : apiSuccess({ message: "Submission received." }, 201),
        cors,
      );
    }

    const headerKey = request.headers.get("idempotency-key");
    const helperKey = readHelperField(parsed.payload, "_idempotency_key");
    const idempotencyKey = headerKey ?? helperKey;
    if (idempotencyKey && idempotencyKey.length > 255) {
      throw new AppError("INVALID_REQUEST", "The idempotency key is too long.");
    }

    const result = await ingestSubmission({
      formId,
      payload: parsed.payload,
      idempotencyKey,
      clientIp: clientIp(request),
      requestOrigin: origin,
      sourceOrigin: readHelperField(parsed.payload, "_subject") ?? origin,
    });

    const redirectTarget = isHtml
      ? safeRedirectTarget(readHelperField(parsed.payload, "_redirect"))
      : null;
    if (redirectTarget) {
      const response = NextResponse.redirect(redirectTarget, 303);
      return withCors(response, cors);
    }

    if (isHtml) {
      const response = htmlResponse(
        200,
        "Thanks — your message was received.",
        "The form owner can now review it in Formivo. You can close this page.",
      );
      return withCors(response, cors);
    }

    const response = apiSuccess(
      {
        leadId: result.submissionId,
        message: result.replayed ? "Submission already received." : "Submission received.",
      },
      result.replayed ? 200 : 201,
    );
    return withCors(response, cors);
  } catch (error) {
    const appError = toAppError(error);

    if (accept.includes("text/html")) {
      return withCors(
        htmlResponse(
          appError.status === 429 ? 429 : appError.status,
          appError.status === 429 ? "Too many requests" : "Submission could not be saved",
          appError.message,
          appError.status === 429
            ? ""
            : '<p style="margin-top:12px;color:#64748b;font-size:12px;">You can go back and try again.</p>',
        ),
        cors,
      );
    }

    return withCors(apiError(appError), cors);
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
    { status: 405, headers: { Allow: "POST, OPTIONS", "Cache-Control": "no-store" } },
  );
}
