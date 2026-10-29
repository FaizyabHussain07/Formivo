import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const cfg = JSON.parse(readFileSync(".tmp-verify.json", "utf8"));
const endpoint = `http://localhost:3000/api/f/${cfg.formId}/submissions`;
const body = { data: { name: "Ada Lovelace", email: "ada@example.com", message: "Hello from verification" }, metadata: { page: "/contact" } };

async function post(payload, { secret = cfg.secret, key, contentType = "application/json" } = {}) {
  const headers = { "Content-Type": contentType };
  if (secret) headers.Authorization = `Bearer ${secret}`;
  if (key) headers["Idempotency-Key"] = key;
  const res = await fetch(endpoint, { method: "POST", headers, body: typeof payload === "string" ? payload : JSON.stringify(payload) });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

const results = {};
const key = "verify-key-1";
const first = await post(body, { key });
results.first = first;
const replay = await post(body, { key });
results.replay = replay;
const conflict = await post({ data: { name: "Different" } }, { key });
results.conflict = conflict;
const unauthorized = await post(body, { secret: "fm_live_wrong" });
results.unauthorized = unauthorized;
const media = await post(body, { contentType: "text/plain" });
results.media = media;
const method = await fetch(endpoint).then(async (r) => ({ status: r.status, json: await r.json() }));

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: subs } = await admin.from("submissions").select("id, status, metadata").eq("form_id", cfg.formId);
results.savedCount = subs?.length;
results.savedMetadata = subs?.[0]?.metadata;

await admin.from("forms").update({ status: "paused" }).eq("id", cfg.formId);
const paused = await post(body);
results.paused = paused;
await admin.from("forms").update({ status: "active" }).eq("id", cfg.formId);

const { data: usage } = await admin.from("usage_periods").select("submission_count").eq("workspace_id", cfg.workspaceId).single();
results.usage = usage?.submission_count;
results.method = method;

const expectations = [
  ["first", 201], ["replay", 200], ["conflict", 409], ["unauthorized", 401], ["media", 415], ["paused", 409], ["method", 405],
];
let ok = true;
for (const [name, expected] of expectations) {
  const actual = results[name]?.status;
  if (actual !== expected) { ok = false; console.log("FAIL", name, "expected", expected, "got", actual, JSON.stringify(results[name]?.json)); }
}
if (results.savedCount !== 1) { ok = false; console.log("FAIL saved count", results.savedCount); }
if (results.usage !== 1) { ok = false; console.log("FAIL usage", results.usage); }
if (results.replay.json?.leadId !== results.first.json?.leadId) { ok = false; console.log("FAIL replay leadId mismatch"); }
console.log(ok ? "HTTP E2E PASS" : "HTTP E2E FAIL");
console.log(JSON.stringify(results, null, 2).slice(0, 2200));
