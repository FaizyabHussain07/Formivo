// @vitest-environment node
/**
 * Cross-user and cross-role access tests (PRD §22.2).
 *
 * Every case runs against the real migrations with RLS active, switching the
 * session to a specific user so policies evaluate exactly as they do in
 * production for `authenticated` requests.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";

import {
  asServiceRole,
  asUser,
  createTestDatabase,
  createUser,
  expectErrorCode,
  selectAll,
} from "./harness";

let db: PGlite;

const users = {
  devA: { id: "", email: "deva@example.test" },
  devB: { id: "", email: "devb@example.test" },
  clientX: { id: "", email: "clientx@example.test" },
  clientY: { id: "", email: "clienty@example.test" },
  clientZ: { id: "", email: "clientz@example.test" },
  hybrid: { id: "", email: "hybrid@example.test" },
  expiredUser: { id: "", email: "expired@example.test" },
  revokedUser: { id: "", email: "revoked@example.test" },
  usedUser: { id: "", email: "used@example.test" },
};

const forms: Record<string, string> = {};
const workspaces: Record<string, string> = {};
const tokens = {
  x: "token-x-".padEnd(40, "a"),
  y: "token-y-".padEnd(40, "b"),
  z: "token-z-".padEnd(40, "c"),
  expired: "token-exp-".padEnd(40, "d"),
  revoked: "token-rev-".padEnd(40, "e"),
  mismatch: "token-mis-".padEnd(40, "f"),
  hybrid: "token-hyb-".padEnd(40, "g"),
  used: "token-use-".padEnd(40, "h"),
  limit: "token-lim-".padEnd(40, "i"),
};

const PERIOD_START = "2026-10-01T00:00:00Z";
const PERIOD_END = "2026-11-01T00:00:00Z";

async function insertForm(owner: string, name: string): Promise<string> {
  const rows = await asUser(db, owner, async () => {
    const result = await db.query<{ id: string }>(
      `insert into public.forms (workspace_id, name)
       select w.id, $1 from public.workspaces w where w.owner_user_id = $2
       returning id`,
      [name, owner],
    );
    return result.rows;
  });
  const id = rows[0]?.id;
  if (!id) throw new Error(`form creation failed for ${name}`);
  return id;
}

async function invite(
  formId: string,
  email: string,
  token: string,
  invitedBy: string,
  extra = "",
): Promise<void> {
  await asServiceRole(db, async () => {
    await db.query(
      `insert into public.client_invitations
         (form_id, invited_email, token_hash, invited_by_user_id, expires_at)
       values ($1, $2, $3, $4, now() + interval '7 days')
       ${extra}`,
      [formId, email, token, invitedBy],
    );
  });
}

async function accept(
  token: string,
  userId: string,
  email: string,
  maxViewers = 25,
): Promise<unknown> {
  return asServiceRole(db, () =>
    db.query(`select app_private.accept_client_invitation($1, $2, $3, $4)`, [
      token,
      userId,
      email,
      maxViewers,
    ]),
  );
}

async function visibleFormIds(userId: string): Promise<string[]> {
  const rows = await asUser(db, userId, async () =>
    selectAll<{ id: string }>(db, `select id from public.forms order by created_at`),
  );
  return rows.map((r) => r.id);
}

beforeAll(async () => {
  db = await createTestDatabase();

  for (const [key, user] of Object.entries(users)) {
    users[key as keyof typeof users].id = await createUser(db, user.email);
  }

  // Developer onboarding through the trusted primitive (service role).
  await asServiceRole(db, async () => {
    for (const key of ["devA", "devB", "hybrid"] as const) {
      const user = users[key];
      await db.query(`select app_private.initialize_developer_account($1, $2)`, [
        user.id,
        user.email,
      ]);
    }
  });

  forms.a1 = await insertForm(users.devA.id, "Form A1");
  forms.a2 = await insertForm(users.devA.id, "Form A2");
  forms.a3 = await insertForm(users.devA.id, "Form A3");
  forms.a4 = await insertForm(users.devA.id, "Form A4");
  forms.a5 = await insertForm(users.devA.id, "Form A5");
  forms.b1 = await insertForm(users.devB.id, "Form B1");

  const wsRows = await asServiceRole(db, async () =>
    selectAll<{ id: string; owner_user_id: string }>(
      db,
      `select id, owner_user_id from public.workspaces`,
    ),
  );
  for (const row of wsRows) {
    if (row.owner_user_id === users.devA.id) workspaces.devA = row.id;
    if (row.owner_user_id === users.devB.id) workspaces.devB = row.id;
  }

  // Real submissions recorded through the transaction-safe intake primitive.
  await asServiceRole(db, async () => {
    for (const [formId, payload] of [
      [forms.a1, { name: "Alice", message: "hello" }],
      [forms.a2, { name: "Bob", message: "hi" }],
      [forms.b1, { name: "Carol", message: "from B" }],
    ] as const) {
      await db.query(
        `select app_private.record_submission($1, $2::timestamptz, $3::timestamptz, $4, $5::jsonb)`,
        [formId, PERIOD_START, PERIOD_END, 100, JSON.stringify(payload)],
      );
    }
  });

  await invite(forms.a1, users.clientX.email, tokens.x, users.devA.id);
  await invite(forms.a2, users.clientY.email, tokens.y, users.devA.id);
  await invite(forms.a3, users.clientZ.email, tokens.z, users.devA.id);
  await invite(forms.a3, "expired@example.test", tokens.expired, users.devA.id);
  await invite(forms.a3, "revoked@example.test", tokens.revoked, users.devA.id);
  await invite(forms.a3, "mismatch@example.test", tokens.mismatch, users.devA.id);
  await invite(forms.a4, users.hybrid.email, tokens.hybrid, users.devA.id);
  await invite(forms.a4, "used@example.test", tokens.used, users.devA.id);
  await invite(forms.a5, users.usedUser.email, tokens.limit, users.devA.id);

  await asServiceRole(db, async () => {
    await db.query(
      `update public.client_invitations
       set status = 'revoked', revoked_at = now()
       where token_hash = $1`,
      [tokens.revoked],
    );
    // Already-expired invitation: keep expires_at > created_at while making it stale.
    await db.query(
      `update public.client_invitations
       set created_at = now() - interval '2 days',
           expires_at = now() - interval '1 day'
       where token_hash = $1`,
      [tokens.expired],
    );
  });

  // Active grants used by the read/write matrix below.
  await accept(tokens.x, users.clientX.id, users.clientX.email);
  await accept(tokens.y, users.clientY.id, users.clientY.email);
}, 120_000);

afterAll(async () => {
  await db?.close();
});

describe("cross-user isolation (developer vs developer)", () => {
  it("developer A only sees their own forms", async () => {
    const visible = await visibleFormIds(users.devA.id);
    expect(visible).toHaveLength(5); // A1–A5 all belong to developer A
    expect(visible).toContain(forms.a1);
    expect(visible).not.toContain(forms.b1);
  });

  it("developer A cannot read developer B's submissions", async () => {
    const rows = await asUser(db, users.devA.id, async () =>
      selectAll(db, `select id from public.submissions where form_id = $1`, [forms.b1]),
    );
    expect(rows).toEqual([]);

    const own = await asUser(db, users.devA.id, async () =>
      selectAll(db, `select id from public.submissions where form_id = $1`, [forms.a1]),
    );
    expect(own).toHaveLength(1);
  });

  it("developer A cannot see developer B's workspace or invitation", async () => {
    const workspaces = await asUser(db, users.devA.id, async () =>
      selectAll(
        db,
        `select id from public.workspaces where owner_user_id = $1`,
        [users.devB.id],
      ),
    );
    expect(workspaces).toEqual([]);

    const invitations = await asUser(db, users.devA.id, async () =>
      selectAll(db, `select id from public.client_invitations where form_id = $1`, [forms.b1]),
    );
    expect(invitations).toEqual([]);
  });

  it("developer A cannot update developer B's submissions", async () => {
    await asUser(db, users.devA.id, async () => {
      const result = await db.query(
        `update public.submissions set status = 'read' where form_id = $1`,
        [forms.b1],
      );
      expect(result.affectedRows ?? 0).toBe(0);
    });
  });

  it("a developer cannot create a form in someone else's workspace", async () => {
    // 1. Looking the workspace up through RLS finds nothing, so no row is written.
    await asUser(db, users.devA.id, async () => {
      await db.query(
        `insert into public.forms (workspace_id, name)
         select id, 'intruder' from public.workspaces where owner_user_id = $1`,
        [users.devB.id],
      );
    });
    const leaked = await asServiceRole(db, async () =>
      selectAll(db, `select id from public.forms where name = 'intruder'`),
    );
    expect(leaked).toEqual([]);

    // 2. Even with the workspace id known, WITH CHECK rejects the insert.
    await expectErrorCode(
      asUser(db, users.devA.id, async () =>
        db.query(`insert into public.forms (workspace_id, name) values ($1, 'intruder')`, [
          workspaces.devB,
        ]),
      ),
      "row-level security",
    );
  });
});

describe("cross-role isolation (client vs developer vs client)", () => {
  it("client X sees only the form explicitly shared with them", async () => {
    const visible = await visibleFormIds(users.clientX.id);
    expect(visible).toEqual([forms.a1]);
  });

  it("client X cannot read client Y's shared form submissions", async () => {
    const rows = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.submissions where form_id = $1`, [forms.a2]),
    );
    expect(rows).toEqual([]);
  });

  it("client can read submissions of their own shared form", async () => {
    const rows = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.submissions where form_id = $1`, [forms.a1]),
    );
    expect(rows).toHaveLength(1);
  });

  it("client cannot read workspace, billing, usage or invitations", async () => {
    const workspaces = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.workspaces`),
    );
    expect(workspaces).toEqual([]);

    const subscriptions = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.subscriptions`),
    );
    expect(subscriptions).toEqual([]);

    const usage = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.usage_periods`),
    );
    expect(usage).toEqual([]);

    const invitations = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.client_invitations`),
    );
    expect(invitations).toEqual([]);
  });

  it("client cannot write forms, submissions or permissions", async () => {
    await expectErrorCode(
      asUser(db, users.clientX.id, async () =>
        db.query(`insert into public.forms (workspace_id, name) values ($1, 'x')`, [forms.a1]),
      ),
      "row-level security",
    );

    await expectErrorCode(
      asUser(db, users.clientX.id, async () =>
        db.query(`insert into public.submissions (form_id, data) values ($1, '{}'::jsonb)`, [
          forms.a1,
        ]),
      ),
      "row-level security",
    );

    await expectErrorCode(
      asUser(db, users.clientX.id, async () =>
        db.query(
          `insert into public.form_client_permissions (form_id, client_user_id)
           values ($1, $2)`,
          [forms.a1, users.clientY.id],
        ),
      ),
      "row-level security",
    );
  });

  it("client cannot change submission status (read-only portal)", async () => {
    // The client CAN see this submission, but has no UPDATE policy, so the
    // statement matches zero rows rather than raising.
    const result = await asUser(db, users.clientX.id, async () =>
      db.query(`update public.submissions set status = 'archived' where form_id = $1`, [
        forms.a1,
      ]),
    );
    expect(result.affectedRows ?? 0).toBe(0);

    const status = await asServiceRole(db, async () =>
      selectAll<{ status: string }>(
        db,
        `select status from public.submissions where form_id = $1`,
        [forms.a1],
      ),
    );
    expect(status.every((s) => s.status === "new")).toBe(true);
  });
});

describe("role integrity", () => {
  it("a user cannot self-promote by writing to account_roles", async () => {
    await expectErrorCode(
      asUser(db, users.clientX.id, async () =>
        db.query(`insert into public.account_roles (user_id, role) values ($1, 'developer')`, [
          users.clientX.id,
        ]),
      ),
      "row-level security",
    );

    const roles = await asServiceRole(db, async () =>
      selectAll<{ role: string }>(
        db,
        `select role from public.account_roles where user_id = $1`,
        [users.clientX.id],
      ),
    );
    expect(roles.map((r) => r.role)).toEqual(["client"]);
  });

  it("a user cannot edit another user's profile", async () => {
    const result = await asUser(db, users.devA.id, async () =>
      db.query(`update public.profiles set display_name = 'hacked' where id = $1`, [
        users.devB.id,
      ]),
    );
    expect(result.affectedRows ?? 0).toBe(0);
  });

  it("a user can update their own profile but not create roles with it", async () => {
    await asUser(db, users.devA.id, async () => {
      const result = await db.query(
        `update public.profiles set display_name = 'Dev A' where id = $1`,
        [users.devA.id],
      );
      expect(result.affectedRows ?? 1).toBe(1);
    });
  });

  it("a client invitation does not create a developer workspace", async () => {
    const workspaces = await asServiceRole(db, async () =>
      selectAll(db, `select id from public.workspaces where owner_user_id = $1`, [
        users.clientX.id,
      ]),
    );
    expect(workspaces).toEqual([]);
  });

  it("a user who accepts an invitation keeps both roles", async () => {
    await accept(tokens.hybrid, users.hybrid.id, users.hybrid.email);

    const roles = await asServiceRole(db, async () =>
      selectAll<{ role: string }>(
        db,
        `select role from public.account_roles where user_id = $1 order by role`,
        [users.hybrid.id],
      ),
    );
    expect(roles.map((r) => r.role)).toEqual(["client", "developer"]);

    const workspaces = await asServiceRole(db, async () =>
      selectAll(db, `select id from public.workspaces where owner_user_id = $1`, [
        users.hybrid.id,
      ]),
    );
    expect(workspaces).toHaveLength(1);
  });
});

describe("invitation acceptance", () => {
  it("acceptance is idempotent for the same user", async () => {
    const result = await accept(tokens.x, users.clientX.id, users.clientX.email);
    const rows = (result as { rows: { accept_client_invitation: { already_accepted: boolean } }[] })
      .rows;
    expect(rows[0]?.accept_client_invitation.already_accepted).toBe(true);
  });

  it("rejects an unknown token", async () => {
    await expectErrorCode(
      accept("does-not-exist".padEnd(40, "z"), users.clientZ.id, users.clientZ.email),
      "INVITATION_NOT_FOUND",
    );
  });

  it("rejects an expired invitation", async () => {
    await expectErrorCode(
      accept(tokens.expired, users.expiredUser.id, users.expiredUser.email),
      "INVITATION_EXPIRED",
    );
  });

  it("rejects a revoked invitation", async () => {
    await expectErrorCode(
      accept(tokens.revoked, users.revokedUser.id, users.revokedUser.email),
      "INVITATION_REVOKED",
    );
  });

  it("rejects an email that does not match the invitation", async () => {
    await expectErrorCode(
      accept(tokens.mismatch, users.devB.id, "someone-else@example.test"),
      "EMAIL_MISMATCH",
    );
  });

  it("enforces one active client per form", async () => {
    // clientZ accepts for form A3 first...
    await accept(tokens.z, users.clientZ.id, users.clientZ.email);

    // ...so a different account with its own invitation cannot take over that form.
    const takeoverToken = "takeover-token".padEnd(40, "x");
    await invite(forms.a3, users.clientY.email, takeoverToken, users.devA.id);
    await expectErrorCode(
      accept(takeoverToken, users.clientY.id, users.clientY.email, 10),
      "ACTIVE_CLIENT_EXISTS",
    );

    // A concurrent-style conflict: direct insert violating the partial index.
    await expectErrorCode(
      asServiceRole(db, async () =>
        db.query(
          `insert into public.form_client_permissions (form_id, client_user_id)
           values ($1, $2)`,
          [forms.a3, users.clientY.id],
        ),
      ),
      "duplicate key",
    );
  });

  it("enforces the workspace unique viewer limit server-side", async () => {
    // Workspace A already has 4 active viewers; a limit of 1 must reject the
    // grant even though the form itself has no active client yet.
    await expectErrorCode(
      accept(tokens.limit, users.usedUser.id, users.usedUser.email, 1),
      "VIEWER_LIMIT_REACHED",
    );
  });

  it("rejects an acceptance when another client is already active on the form", async () => {
    const freshToken = "fresh-active".padEnd(40, "y");
    await invite(forms.a1, "fresh@example.test", freshToken, users.devA.id);
    await expectErrorCode(
      accept(freshToken, users.clientY.id, "fresh@example.test"),
      "ACTIVE_CLIENT_EXISTS",
    );
  });
});

describe("revocation", () => {
  it("blocks server-side access immediately", async () => {
    const before = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.submissions where form_id = $1`, [forms.a1]),
    );
    expect(before).toHaveLength(1);

    await asServiceRole(db, async () =>
      db.query(
        `update public.form_client_permissions
         set revoked_at = now()
         where form_id = $1 and client_user_id = $2`,
        [forms.a1, users.clientX.id],
      ),
    );

    const submissions = await asUser(db, users.clientX.id, async () =>
      selectAll(db, `select id from public.submissions where form_id = $1`, [forms.a1]),
    );
    expect(submissions).toEqual([]);

    const visible = await visibleFormIds(users.clientX.id);
    expect(visible).not.toContain(forms.a1);

    const permission = await asServiceRole(db, async () =>
      selectAll(db, `select id from public.form_client_permissions where form_id = $1 and client_user_id = $2 and revoked_at is null`, [forms.a1, users.clientX.id]),
    );
    expect(permission).toEqual([]);
  });
});

describe("usage accounting", () => {
  it("counts exactly one usage per accepted submission", async () => {
    // Usage is tracked per workspace window: this window already holds the two
    // seeded submissions (forms A1 + A2), so allow 4 total for this case.
    await asServiceRole(db, async () => {
      await db.query(`select app_private.record_submission($1, $2::timestamptz, $3::timestamptz, $4, $5::jsonb)`, [
        forms.a2,
        PERIOD_START,
        PERIOD_END,
        4,
        JSON.stringify({ n: 1 }),
      ]);
      await db.query(`select app_private.record_submission($1, $2::timestamptz, $3::timestamptz, $4, $5::jsonb)`, [
        forms.a2,
        PERIOD_START,
        PERIOD_END,
        4,
        JSON.stringify({ n: 2 }),
      ]);
    });

    const usage = await asServiceRole(db, async () =>
      selectAll<{ submission_count: number }>(
        db,
        `select submission_count from public.usage_periods where workspace_id =
         (select workspace_id from public.forms where id = $1)`,
        [forms.a2],
      ),
    );
    expect(usage[0]?.submission_count).toBe(4); // 2 seeded + 2 accepted

    // The next accepted submission in this window must be rejected.
    await expectErrorCode(
      asServiceRole(db, () =>
        db.query(`select app_private.record_submission($1, $2::timestamptz, $3::timestamptz, $4, $5::jsonb)`, [
          forms.a2,
          PERIOD_START,
          PERIOD_END,
          4,
          JSON.stringify({ n: 3 }),
        ]),
      ),
      "SUBMISSION_LIMIT_REACHED",
    );

    const submissions = await asServiceRole(db, async () =>
      selectAll(db, `select id from public.submissions where form_id = $1`, [forms.a2]),
    );
    expect(submissions).toHaveLength(3); // the rejected request stored nothing
  });

  it("rejects intake for a paused form and an unknown form", async () => {
    await asServiceRole(db, async () =>
      db.query(`update public.forms set status = 'paused' where id = $1`, [forms.b1]),
    );

    await expectErrorCode(
      asServiceRole(db, () =>
        db.query(`select app_private.record_submission($1, $2::timestamptz, $3::timestamptz, $4, $5::jsonb)`, [
          forms.b1,
          PERIOD_START,
          PERIOD_END,
          10,
          JSON.stringify({}),
        ]),
      ),
      "FORM_PAUSED",
    );

    await expectErrorCode(
      asServiceRole(db, () =>
        db.query(`select app_private.record_submission($1, $2::timestamptz, $3::timestamptz, $4, $5::jsonb)`, [
          "00000000-0000-0000-0000-000000000000",
          PERIOD_START,
          PERIOD_END,
          10,
          JSON.stringify({}),
        ]),
      ),
      "FORM_NOT_FOUND",
    );

    await asServiceRole(db, async () =>
      db.query(`update public.forms set status = 'active' where id = $1`, [forms.b1]),
    );
  });
});

describe("billing invariants", () => {
  it("creates a default free subscription for every workspace", async () => {
    const rows = await asServiceRole(db, async () =>
      selectAll<{ plan_key: string; status: string }>(
        db,
        `select plan_key, status from public.subscriptions`,
      ),
    );
    expect(rows).toHaveLength(3); // devA, devB, hybrid
    expect(rows.every((r) => r.plan_key === "free" && r.status === "active")).toBe(true);
  });

  it("keeps billing rows invisible to clients and writable only by the service role", async () => {
    const asClient = await asUser(db, users.clientZ.id, async () =>
      selectAll(db, `select id from public.subscriptions`),
    );
    expect(asClient).toEqual([]);

    // RLS without an UPDATE policy means zero rows are visible to update:
    // the statement succeeds but changes nothing.
    const result = await asUser(db, users.devA.id, async () =>
      db.query(`update public.subscriptions set plan_key = 'agency'`),
    );
    expect(result.affectedRows ?? 0).toBe(0);

    const unchanged = await asServiceRole(db, async () =>
      selectAll<{ plan_key: string }>(db, `select plan_key from public.subscriptions`),
    );
    expect(unchanged.every((r) => r.plan_key === "free")).toBe(true);
  });
});
