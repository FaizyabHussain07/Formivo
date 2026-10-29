/**
 * Local database verification harness.
 *
 * Boots an embedded Postgres (PGlite), creates the Supabase environment contract
 * our migrations rely on (`auth.users`, `auth.uid()`, the `anon` /
 * `authenticated` / `service_role` roles and Supabase's default grants), applies
 * every migration in `supabase/migrations/`, and exposes helpers to run queries
 * as a specific authenticated user so RLS policies can be tested per user.
 *
 * This mirrors a local Supabase environment; see docs/database.md for the exact
 * environment assumptions and how to run the same migrations on a real project.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const MIGRATIONS_DIR = path.resolve("supabase/migrations");

/** Supabase-equivalent bootstrap that must exist before our migrations run. */
const SUPABASE_SHIM_SQL = `
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
end
$$;

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now()
);

-- Mirrors Supabase's auth.uid(): reads the JWT claims of the current request.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    ),
    ''
  )::uuid;
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to postgres, anon, authenticated, service_role;
`;

export function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort();
}

export async function createTestDatabase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_SHIM_SQL);

  for (const file of migrationFiles()) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    try {
      await db.exec(sql);
    } catch (error) {
      throw new Error(`Migration failed: ${file}\n${(error as Error).message}`, { cause: error });
    }
  }

  return db;
}

/** Creates an auth user row exactly as Supabase Auth would (id + email only). */
export async function createUser(db: PGlite, email: string): Promise<string> {
  const result = await db.query<{ id: string }>(
    `insert into auth.users (email) values ($1) returning id`,
    [email],
  );
  const id = result.rows[0]?.id;
  if (!id) throw new Error("failed to create test user");
  return id;
}

/**
 * Runs `fn` with the request JWT set to `userId` and the `authenticated` role
 * active, so RLS policies evaluate exactly as they would for a signed-in user.
 */
export async function asUser<T>(db: PGlite, userId: string, fn: () => Promise<T>): Promise<T> {
  await db.query(`select set_config('request.jwt.claims', $1, false)`, [
    JSON.stringify({ sub: userId, role: "authenticated" }),
  ]);
  await db.query(`set role authenticated`);
  try {
    return await fn();
  } finally {
    await db.query(`reset role`);
    await db.query(`select set_config('request.jwt.claims', '', false)`);
  }
}

/** Runs `fn` as the service role (bypasses RLS, as the server-side admin client does). */
export async function asServiceRole<T>(db: PGlite, fn: () => Promise<T>): Promise<T> {
  await db.query(`set role service_role`);
  try {
    return await fn();
  } finally {
    await db.query(`reset role`);
  }
}

/** Asserts that an async call rejects with a machine-readable error code. */
export async function expectErrorCode(call: Promise<unknown>, code: string): Promise<void> {
  try {
    await call;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes(code)) return;
    throw new Error(`expected error code ${code}, got: ${message}`);
  }
  throw new Error(`expected error code ${code}, but the call succeeded`);
}

export async function selectAll<T>(db: PGlite, sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await db.query<T>(sql, params);
  return result.rows;
}
