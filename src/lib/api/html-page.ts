import { siteConfig } from "@/config/site";

const PRODUCT_URL = siteConfig.productionUrl;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Small, self-contained HTML page used for public form submissions (success and error).
 * It must not depend on the app shell, fonts or JavaScript: third-party visitors land
 * here and should see a trustworthy, branded confirmation.
 */
export function submissionPage({
  title,
  message,
  tone = "success",
}: {
  title: string;
  message: string;
  tone?: "success" | "error";
}): string {
  const accent = tone === "success" ? "#0f766e" : "#b91c1c";
  const accentBg = tone === "success" ? "#e6f4f1" : "#fef2f2";
  const icon =
    tone === "success"
      ? `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`
      : `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="${accent}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5h.01"/></svg>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(title)} · Formivo</title>
    <style>
      *{box-sizing:border-box}
      body{margin:0;min-height:100vh;display:flex;flex-direction:column;background:#f7f9f8;color:#0b1f1c;
        font-family:Inter,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;padding:24px}
      .wrap{flex:1;display:grid;place-items:center;padding:24px 0}
      .card{width:100%;max-width:520px;background:#fff;border:1px solid #e2e9e6;border-radius:20px;
        padding:40px 32px;text-align:center;box-shadow:0 1px 2px rgba(11,31,28,.04),0 18px 40px -28px rgba(11,31,28,.35)}
      .badge{width:56px;height:56px;border-radius:16px;background:${accentBg};display:grid;place-items:center;margin:0 auto 20px}
      h1{margin:0 0 10px;font-size:22px;line-height:1.3;letter-spacing:-.01em}
      p{margin:0;color:#485a56;font-size:14.5px;line-height:1.65}
      .actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:26px}
      .btn{display:inline-flex;align-items:center;gap:8px;border-radius:10px;padding:11px 18px;font-size:14px;
        font-weight:600;text-decoration:none;border:1px solid transparent}
      .btn-primary{background:${accent};color:#fff}
      .btn-secondary{background:#fff;color:#0b1f1c;border-color:#e2e9e6}
      .brand{display:flex;align-items:center;gap:9px;justify-content:center;font-weight:700;font-size:15px;
        color:#0b1f1c;text-decoration:none}
      .brand svg{flex:none}
      footer{padding:22px 0 6px;text-align:center;font-size:12.5px;color:#6d7f7a}
      footer a{color:#0f766e;text-decoration:none;font-weight:600}
      @media (max-width:420px){.card{padding:32px 22px}}
    </style>
  </head>
  <body>
    <div class="wrap">
      <main class="card">
        <div class="badge">${icon}</div>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(message)}</p>
        <div class="actions">
          <a class="btn btn-secondary" href="${PRODUCT_URL}">Go to Formivo</a>
          <a class="btn btn-primary" href="#" onclick="history.back();return false;">Go back</a>
        </div>
      </main>
    </div>
    <footer>
      <a class="brand" href="${PRODUCT_URL}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect width="24" height="24" rx="6" fill="#0f766e"/>
          <path d="M8 17V7h8M8 12h6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Formivo
      </a>
      <p style="margin:6px 0 0">The form backend for developers who ship for clients.</p>
      <p style="margin:6px 0 0"><a href="${PRODUCT_URL}">${PRODUCT_URL.replace(/^https?:\/\//, "")}</a></p>
    </footer>
  </body>
</html>`;
}
