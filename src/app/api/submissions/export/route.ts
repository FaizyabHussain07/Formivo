import { NextResponse } from "next/server";

import { getClientContext, getDeveloperContext, getSessionUser } from "@/lib/auth/viewer";
import { AppError } from "@/lib/errors";
import { buildSubmissionsCsv, recordExport } from "@/lib/submissions/export";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

/**
 * CSV export. Both roles are re-authorized here from the session, never from the
 * query string: a developer only exports their own workspace, a client only forms
 * shared with them, and a free workspace is refused server-side.
 */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError(401, "UNAUTHORIZED", "Sign in to export submissions.");

  const formIdParam = new URL(request.url).searchParams.get("formId");
  const formId = formIdParam && UUID_PATTERN.test(formIdParam) ? formIdParam : undefined;
  if (formIdParam && !formId) return jsonError(400, "INVALID_REQUEST", "Unknown form.");

  try {
    const developer = await getDeveloperContext();
    if (developer) {
      const { filename, csv, rowCount } = await buildSubmissionsCsv({
        kind: "developer",
        workspaceId: developer.workspace.id,
        formId,
      });

      await recordExport({
        actorUserId: developer.user.id,
        workspaceId: developer.workspace.id,
        formId: formId ?? null,
        rowCount,
        subject: "developer",
      });

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const client = await getClientContext();
    if (!client) return jsonError(403, "FORBIDDEN", "You do not have access to this export.");
    if (!formId) return jsonError(400, "INVALID_REQUEST", "Choose a form to export.");

    const { filename, csv, rowCount } = await buildSubmissionsCsv({
      kind: "client",
      formId,
      clientUserId: client.user.id,
    });

    await recordExport({
      actorUserId: client.user.id,
      workspaceId: null,
      formId,
      rowCount,
      subject: "client",
    });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return jsonError(error.status, error.code, error.message);
    }
    return jsonError(500, "INTERNAL_ERROR", "The export could not be generated.");
  }
}
