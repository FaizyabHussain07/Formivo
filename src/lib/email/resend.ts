import "server-only";

import { getIntegrationStatus } from "@/lib/env/integrations";
import { getServerEnv } from "@/lib/env/server";

export type SendEmailResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: "not_configured" | "rate_limited" | "provider_error" };

/** Sends transactional email through Resend's REST API (no SDK dependency). */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendEmailResult> {
  const env = getServerEnv();
  const status = getIntegrationStatus(env, "resend");
  if (!status.configured || !env.RESEND_API_KEY) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Formivo <${env.RESEND_FROM_EMAIL}>`,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      // Never log the response body: it can echo provider details.
      console.error(`Resend responded with status ${response.status}`);
      // 429 = the provider's daily/monthly sending cap for this account.
      return { sent: false, reason: response.status === 429 ? "rate_limited" : "provider_error" };
    }

    const body = (await response.json().catch(() => null)) as { id?: string } | null;
    return { sent: true, id: body?.id ?? null };
  } catch {
    return { sent: false, reason: "provider_error" };
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function invitationEmail(input: {
  formName: string;
  workspaceName: string;
  inviteUrl: string;
  expiresAt: Date;
  appUrl: string;
}): { html: string; text: string; subject: string } {
  const form = escapeHtml(input.formName);
  const workspace = escapeHtml(input.workspaceName);
  const url = escapeHtml(input.inviteUrl);
  const expires = input.expiresAt.toISOString().slice(0, 10);
  const appUrl = escapeHtml(input.appUrl);

  const subject = `${workspace} shared "${input.formName}" with you on Formivo`;

  const text = [
    `${workspace} invited you to review submissions for "${input.formName}" on Formivo.`,
    "",
    `Accept the invitation: ${input.inviteUrl}`,
    "",
    `This invitation expires on ${expires}. If you were not expecting it, you can ignore this email.`,
    "",
    `Formivo — ${input.appUrl}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8fafc;font-family:Inter,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="font-size:16px;font-weight:700;letter-spacing:-0.01em;color:#0f766e;padding-bottom:20px;">Formivo</div>
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
        <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;">You have been invited to review a form</h1>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#475569;">
          <strong style="color:#0f172a;">${workspace}</strong> shared
          <strong style="color:#0f172a;">${form}</strong> with you on Formivo. You will get read-only
          access to its submissions and analytics.
        </p>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">
          This invitation expires on ${expires}.
        </p>
        <a href="${url}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">
          Accept invitation
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
          If the button does not work, copy this link into your browser:<br />
          <span style="word-break:break-all;color:#0f766e;">${url}</span>
        </p>
      </div>
      <p style="margin:20px 4px 0;font-size:12px;line-height:1.6;color:#64748b;">
        You received this email because a Formivo developer invited this address.
        If it was not you, you can safely ignore it.<br />
        <a href="${appUrl}" style="color:#0f766e;">formivo</a>
      </p>
    </div>
  </body>
</html>`;

  return { html, text, subject };
}
