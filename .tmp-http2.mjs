import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const cfg = JSON.parse(readFileSync(".tmp-verify.json", "utf8"));
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const { data: form, error } = await admin.from("forms").insert({ workspace_id: cfg.workspaceId, name: "Endpoint-only verification" }).select("id").single();
if (error) throw error;
const formId = form.id;
const base = `http://localhost:3100/api/f/${formId}`;
const results = {};

async function send(body, { method = "POST", headers = {}, accept } = {}) {
  const h = { ...headers };
  if (accept) h.Accept = accept;
  const res = await fetch(base, { method, headers: h, body, redirect: "manual" });
  const text = await res.text();
  return { status: res.status, type: res.headers.get("content-type"), acao: res.headers.get("access-control-allow-origin"), location: res.headers.get("location"), body: text.slice(0, 160) };
}

results.json = await send(JSON.stringify({ name: "Ada", email: "ada@example.com", message: "No key" }), { headers: { "Content-Type": "application/json" } });
results.replay = await send(JSON.stringify({ name: "Ada", email: "ada@example.com", message: "No key" }), { headers: { "Content-Type": "application/json", "Idempotency-Key": "k1" } });
results.replay2 = await send(JSON.stringify({ name: "Ada", email: "ada@example.com", message: "No key" }), { headers: { "Content-Type": "application/json", "Idempotency-Key": "k1" } });
results.formEncoded = await send("name=Grace&email=grace%40example.com&message=HTML+form", { headers: { "Content-Type": "application/x-www-form-urlencoded" }, accept: "text/html" });
results.redirect = await send("name=Redirect&_redirect=https%3A%2F%2Fexample.com%2Fthanks", { headers: { "Content-Type": "application/x-www-form-urlencoded" }, accept: "text/html" });
results.honeypot = await send(JSON.stringify({ name: "Bot", _gotcha: "http://spam" }), { headers: { "Content-Type": "application/json" } });
results.unknown = await fetch(`http://localhost:3100/api/f/00000000-0000-4000-8000-000000000000`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "x" }) }).then(async r => ({ status: r.status }));
results.media = await send("hello", { headers: { "Content-Type": "text/plain" } });
results.get = await fetch(base).then(async r => ({ status: r.status }));
results.oldPath = await fetch(`${base}/submissions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "x" }) }).then(async r => ({ status: r.status }));
results.oversize = await send("x".repeat(300 * 1024), { headers: { "Content-Type": "application/json" } });
results.preflightOpen = await send(null, { method: "OPTIONS", headers: { Origin: "https://allowed.example", "Access-Control-Request-Method": "POST" } });

await admin.from("forms").update({ settings: { allowed_origins: ["https://allowed.example"] } }).eq("id", formId);
results.preflightAllowed = await send(null, { method: "OPTIONS", headers: { Origin: "https://allowed.example", "Access-Control-Request-Method": "POST" } });
results.preflightEvil = await send(null, { method: "OPTIONS", headers: { Origin: "https://evil.example", "Access-Control-Request-Method": "POST" } });
results.originRejected = await send(JSON.stringify({ name: "Evil" }), { headers: { "Content-Type": "application/json", Origin: "https://evil.example" } });
results.originAllowed = await send(JSON.stringify({ name: "Good" }), { headers: { "Content-Type": "application/json", Origin: "https://allowed.example" } });
await admin.from("forms").update({ settings: {} }).eq("id", formId);

await admin.from("forms").update({ status: "paused" }).eq("id", formId);
results.paused = await send(JSON.stringify({ name: "Paused" }), { headers: { "Content-Type": "application/json" } });
await admin.from("forms").update({ status: "active" }).eq("id", formId);

const { data: subs } = await admin.from("submissions").select("id, data").eq("form_id", formId);
const { data: usage } = await admin.from("usage_periods").select("submission_count").eq("workspace_id", cfg.workspaceId).single();
results.saved = subs?.length;
results.savedPayload = subs?.map(s => s.data);
results.usage = usage?.submission_count;

const checks = [
  ["json", 201], ["replay", 201], ["replay2", 200], ["formEncoded", 200], ["redirect", 303],
  ["honeypot", 201], ["unknown", 404], ["media", 415], ["get", 405], ["oldPath", 404],
  ["oversize", 413], ["preflightOpen", 204], ["preflightAllowed", 204], ["preflightEvil", 204],
  ["originRejected", 403], ["originAllowed", 201], ["paused", 409],
];
let ok = true;
for (const [name, expected] of checks) if (results[name]?.status !== expected) { ok = false; console.log("FAIL", name, expected, results[name]?.status, results[name]?.body); }
const leadA = JSON.parse(results.replay.body).leadId; const leadB = JSON.parse(results.replay2.body).leadId; if (leadA !== leadB) { ok = false; console.log("FAIL idempotent lead mismatch", leadA, leadB); }
if (results.formEncoded.type?.includes("text/html") !== true) { ok = false; console.log("FAIL html content type", results.formEncoded.type); }
if (results.redirect.location !== "https://example.com/thanks") { ok = false; console.log("FAIL redirect", results.redirect.location); }
if (results.preflightOpen.acao !== "*") { ok = false; console.log("FAIL open CORS", results.preflightOpen.acao); }
if (results.preflightAllowed.acao !== "https://allowed.example") { ok = false; console.log("FAIL allowed CORS", results.preflightAllowed.acao); }
if (results.preflightEvil.acao) { ok = false; console.log("FAIL evil CORS", results.preflightEvil.acao); }
if (results.saved !== 5) { ok = false; console.log("FAIL saved", results.saved, results.savedPayload); }
if (results.usage !== 5) { ok = false; console.log("FAIL usage", results.usage); }
console.log(ok ? "ENDPOINT-ONLY E2E PASS" : "ENDPOINT-ONLY E2E FAIL");
console.log(JSON.stringify({ statuses: Object.fromEntries(Object.entries(results).filter(([k]) => typeof results[k]?.status === "number").map(([k, v]) => [k, v.status])), saved: results.saved, usage: results.usage, firstLead: results.json.body.slice(0, 90) }, null, 2));
