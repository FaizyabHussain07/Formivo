import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) throw new Error("missing env");

const admin = createClient(url, service, { auth: { persistSession: false } });
const stamp = Date.now();
const email = `verify.${stamp}@example.com`;
const password = "Verify-Me-12345!";

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email, password, email_confirm: true, user_metadata: { display_name: "Verification User" },
});
if (createError) throw createError;
const userId = created.user.id;

const { error: initError } = await admin.rpc("api_initialize_developer_account", {
  p_user_id: userId, p_email: email, p_display_name: "Verification User",
});
if (initError) throw initError;

const { data: workspace, error: wsError } = await admin.from("workspaces").select("id, name").eq("owner_user_id", userId).single();
if (wsError) throw wsError;

writeFileSync(".tmp-verify.json", JSON.stringify({ userId, email, password, workspaceId: workspace.id }, null, 2));
console.log("created", { email, workspaceId: workspace.id });
