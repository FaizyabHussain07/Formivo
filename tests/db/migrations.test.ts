// @vitest-environment node
/**
 * Verifies that every committed migration applies cleanly to a Supabase-shaped
 * Postgres and that the schema invariants the product depends on exist:
 * RLS on all tables, foreign keys, unique constraints and the one-active-client
 * per form index.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";

import { createTestDatabase, migrationFiles, selectAll } from "./harness";

let db: PGlite;

const EXPECTED_TABLES = [
  "profiles",
  "account_roles",
  "workspaces",
  "forms",
  "submissions",
  "client_invitations",
  "form_client_permissions",
  "subscriptions",
  "usage_periods",
  "webhook_events",
  "audit_logs",
];

beforeAll(async () => {
  db = await createTestDatabase();
}, 120_000);

afterAll(async () => {
  await db?.close();
});

describe("migrations", () => {
  it("ships ordered migration files", () => {
    const files = migrationFiles();
    expect(files.length).toBeGreaterThanOrEqual(7);
    expect([...files].sort()).toEqual(files);
    expect(files[0]).toBe("20261028000100_helpers.sql");
  });

  it("creates all application tables", async () => {
    const tables = await selectAll<{ table_name: string }>(
      db,
      `select table_name from information_schema.tables
       where table_schema = 'public' and table_type = 'BASE TABLE'`,
    );
    const names = tables.map((t) => t.table_name);
    for (const expected of EXPECTED_TABLES) expect(names).toContain(expected);
  });

  it("enables row level security on every application table", async () => {
    const secured = await selectAll<{ relname: string }>(
      db,
      `select c.relname
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relkind = 'r'
         and c.relrowsecurity = false`,
    );
    expect(secured.map((r) => r.relname)).toEqual([]);
  });

  it("applies the one-active-client-per-form partial unique index", async () => {
    const indexes = await selectAll<{ indexdef: string }>(
      db,
      `select indexdef from pg_indexes
       where schemaname = 'public' and tablename = 'form_client_permissions'`,
    );
    const active = indexes.find((i) => i.indexdef.includes("WHERE (revoked_at IS NULL)"));
    expect(active).toBeDefined();
    expect(active?.indexdef).toContain("UNIQUE");
  });

  it("keeps invitation tokens unique and hashed-only by convention", async () => {
    const indexes = await selectAll<{ indexdef: string }>(
      db,
      `select indexdef from pg_indexes
       where schemaname = 'public' and tablename = 'client_invitations'`,
    );
    expect(indexes.some((i) => i.indexdef.includes("token_hash"))).toBe(true);
    expect(
      indexes.some(
        (i) =>
          i.indexdef.includes("invited_email") &&
          i.indexdef.includes("WHERE (status = 'pending'::text)"),
      ),
    ).toBe(true);
  });

  it("enforces usage period uniqueness per workspace window", async () => {
    const indexes = await selectAll<{ indexdef: string }>(
      db,
      `select indexdef from pg_indexes
       where schemaname = 'public' and tablename = 'usage_periods'`,
    );
    expect(
      indexes.some((i) => i.indexdef.includes("UNIQUE") && i.indexdef.includes("workspace_id")),
    ).toBe(true);
  });

  it("wires foreign keys for the ownership path", async () => {
    const fks = await selectAll<{ table_name: string; constraint_name: string }>(
      db,
      `select table_name, constraint_name
       from information_schema.table_constraints
       where constraint_type = 'FOREIGN KEY' and table_schema = 'public'`,
    );
    const pairs = fks.map((f) => `${f.table_name}.${f.constraint_name}`);
    expect(pairs.some((p) => p.startsWith("forms."))).toBe(true);
    expect(pairs.some((p) => p.startsWith("submissions."))).toBe(true);
    expect(pairs.some((p) => p.startsWith("form_client_permissions."))).toBe(true);
    expect(pairs.some((p) => p.startsWith("client_invitations."))).toBe(true);
  });

  it("does not expose privileged functions to API roles", async () => {
    const privileges = await selectAll<{ grantee: string; routine_name: string }>(
      db,
      `select grantee, routine_name
       from information_schema.routine_privileges
       where routine_schema = 'app_private' and grantee in ('anon', 'authenticated')`,
    );
    // Helpers are allowed; privileged entry points must not be.
    const privileged = [
      "initialize_developer_account",
      "accept_client_invitation",
      "record_submission",
    ];
    expect(privileges.filter((p) => privileged.includes(p.routine_name))).toEqual([]);
    expect(privileges.some((p) => p.routine_name === "owns_form")).toBe(true);
  });
});
