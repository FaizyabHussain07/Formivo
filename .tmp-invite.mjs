import { createClient } from "@supabase/supabase-js";
import { createHmac, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const stamp = Date.now();

const devEmail = `dev.${stamp}@example.com`;
const { data: dev, error: devErr } = await admin.auth.admin.createUser({ email: devEmail, password: "Dev-Test-12345!", email_confirm: true, user_metadata: { display_name: "Dev Tester" } });
if (devErr) throw devErr;
await admin.rpc("api_initialize_developer_account", { p_user_id: dev.user.id, p_email: devEmail, p_display_name: "Dev Tester" });
const { data: ws, error: wsErr } = await admin.from("workspaces").select("id, name").eq("owner_user_id", dev.user.id).single();
if (wsErr) throw wsErr;
const { data: form, error: formErr } = await admin.from("forms").insert({ workspace_id: ws.id, name: "Invite Test Form", status: "active" }).select("id").single();
if (formErr) throw formErr;

const clientEmail = `client.${stamp}@example.com`;
const token = randomBytes(32).toString("base64url");
const tokenHash = createHmac("sha256", process.env.INVITATION_TOKEN_PEPPER).update(token).digest("hex");
const { error: invErr } = await admin.from("client_invitations").insert({ form_id: form.id, invited_email: clientEmail, token_hash: tokenHash, invited_by_user_id: dev.user.id, expires_at: new Date(Date.now() + 7 * 86400000).toISOString() });
if (invErr) throw invErr;

const { error: clientErr } = await admin.auth.admin.createUser({ email: clientEmail, password: "Client-Test-12345!", email_confirm: true, user_metadata: { display_name: "Client Tester" } });
if (clientErr) throw clientErr;

writeFileSync(".tmp-invite.json", JSON.stringify({ devEmail, clientEmail, token, formId: form.id, workspaceId: ws.id }, null, 2));
console.log("created", { devEmail, clientEmail, token: token.slice(0, 8) + "…" });
