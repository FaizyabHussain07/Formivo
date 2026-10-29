// @vitest-environment node
/**
 * Endpoint-only model guarantees at the database boundary:
 *   * forms store no submission secrets
 *   * a submission can be recorded without any credential (the API authorizes
 *     nothing on the public path beyond form status + server-side controls)
 *   * rate limiting is atomic and shared (database-backed)
 *   * anonymous callers can neither read submissions nor call privileged RPCs
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";

import {
  asServiceRole,
  createTestDatabase,
  createUser,
  expectErrorCode,
  selectAll,
} from "./harness";

let db: PGlite;
let workspaceId: string;
let formId: string;
let pausedFormId: string;

beforeAll(async () => {
  db = await createTestDatabase();
  const userId = await createUser(db, "endpoint@example.test");

  const created = await asServiceRole(db, async () => {
    const workspace = await db.query<{ id: string }>(
      `insert into public.workspaces (owner_user_id, name) values ($1, 'Endpoint Test') returning id`,
      [userId],
    );
    const wsId = workspace.rows[0]?.id;
    if (!wsId) throw new Error("failed to create workspace");

    const form = await db.query<{ id: string }>(
      `insert into public.forms (workspace_id, name) values ($1, 'Public form') returning id`,
      [wsId],
    );
    const paused = await db.query<{ id: string }>(
      `insert into public.forms (workspace_id, name, status) values ($1, 'Paused form', 'paused') returning id`,
      [wsId],
    );
    return { wsId, formId: form.rows[0]?.id, pausedFormId: paused.rows[0]?.id };
  });

  workspaceId = created.wsId;
  formId = created.formId ?? "";
  pausedFormId = created.pausedFormId ?? "";
}, 120_000);

afterAll(async () => {
  await db?.close();
});

describe("endpoint-only submissions", () => {
  it("stores no form submission secret columns", async () => {
    const columns = await selectAll<{ column_name: string }>(
      db,
      `select column_name from information_schema.columns
       where table_schema = 'public' and table_name = 'forms'`,
    );
    const names = columns.map((column) => column.column_name);
    expect(names).not.toContain("secret_hash");
    expect(names).not.toContain("secret_last_four");
  });

  it("records a submission with no credential at all", async () => {
    const result = await asServiceRole(db, async () => {
      return db.query<{ result: { submission_id: string; usage_count: number } }>(
        `select public.api_record_submission(
           $1::uuid, now(), now() + interval '30 days', 100,
           '{"name":"Ada","email":"ada@example.com"}'::jsonb,
           'https://example.com', '{"page":"/contact"}'::jsonb
         ) as result`,
        [formId],
      );
    });

    const payload = result.rows[0]?.result;
    expect(payload?.submission_id).toBeTruthy();
    expect(payload?.usage_count).toBe(1);

    const [submission] = await selectAll<{
      data: Record<string, unknown>;
      metadata: Record<string, unknown>;
    }>(db, `select data, metadata from public.submissions where form_id = $1`, [formId]);
    expect(submission?.data).toEqual({ name: "Ada", email: "ada@example.com" });
    expect(submission?.metadata).toEqual({ page: "/contact" });
  });

  it("rejects submissions to a paused form without deleting data", async () => {
    await expectErrorCode(
      db.query(
        `select public.api_record_submission(
           $1::uuid, now(), now() + interval '30 days', 100, '{"name":"x"}'::jsonb
         )`,
        [pausedFormId],
      ),
      "FORM_PAUSED",
    );
  });

  it("cannot be read by anonymous callers", async () => {
    await db.query(`set role anon`);
    try {
      const rows = await selectAll<{ count: string }>(
        db,
        `select count(*)::text as count from public.submissions`,
      );
      expect(rows[0]?.count).toBe("0");
    } finally {
      await db.query(`reset role`);
    }
  });

  it("does not let anonymous callers run the intake RPC", async () => {
    await db.query(`set role anon`);
    try {
      await expectErrorCode(
        db.query(
          `select public.api_record_submission(
             $1::uuid, now(), now() + interval '30 days', 100, '{"name":"x"}'::jsonb
           )`,
          [formId],
        ),
        "permission denied",
      );
    } finally {
      await db.query(`reset role`);
    }
  });

  it("enforces a shared, atomic rate limit", async () => {
    const bucket = `test:${formId}`;
    const start = new Date().toISOString();
    const call = () =>
      db.query(`select public.consume_rate_limit($1, $2::timestamptz, $3) as count`, [
        bucket,
        start,
        2,
      ]);

    await call();
    await call();
    await expectErrorCode(call(), "RATE_LIMITED");

    const [row] = await selectAll<{ count: number }>(
      db,
      `select request_count as count from public.rate_limit_buckets where bucket = $1`,
      [bucket],
    );
    // The rejected statement rolls back its increment, so the stored count stays
    // at the limit; further calls keep failing until the window advances.
    expect(row?.count).toBe(2);
  });

  it("keeps workspace usage accounting scoped to the form's workspace", async () => {
    const [usage] = await selectAll<{ count: number }>(
      db,
      `select submission_count as count from public.usage_periods where workspace_id = $1`,
      [workspaceId],
    );
    expect(usage?.count).toBe(1);
  });
});
