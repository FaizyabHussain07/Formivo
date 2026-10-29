import { createClient } from "@supabase/supabase-js";
import { createHmac, randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pepper = process.env.FORM_SECRET_PEPPER;
if (!url || !service || !pepper) throw new Error("missing env");

const admin = createClient(url, service, { auth: { persistSession: false } });
const stamp = Date.now();
const email = `verify.${stamp}@example.com`;
const password = "Verify-Me-12345!";

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { display_name: "Verification User" },
});
if (createError) throw createError;

const userId = created.user.id;
const { error: initError } = await admin.rpc("api_initialize_developer_account", {
  p_user_id: userId,
  p_email: email,
  p_display_name: "Verification User",
});
if (initError) throw initError;

const { data: workspace, error: wsError } = await admin
  .from("workspaces").select("id, name").eq("owner_user_id", userId).single();
if (wsError) throw wsError;

const secret = `fm_live_${randomBytes(32).toString("base64url")}`;
const hash = createHmac("sha256", pepper).update(secret).digest("hex");

const { data: form, error: formError } = await admin
  .from("forms")
  .insert({
    workspace_id: workspace.id,
    name: "Verification contact form",
    description: "Created by the end-to-end verification run.",
    secret_hash: hash,
    secret_last_four: secret.slice(-4),
  })
  .select("id").single();
if (formError) throw formError;

writeFileSync(".tmp-verify.json", JSON.stringify({ userId, email, password, workspaceId: workspace.id, formId: form.id, secret }, null, 2));
console.log("created", { userId, email, workspaceId: workspace.id, formId: form.id });
