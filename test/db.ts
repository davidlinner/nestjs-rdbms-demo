// Database helpers shared by global setup and the e2e suites.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

export const ROOT = resolve(import.meta.dirname, '..');
export const STARTER = resolve(ROOT, '..', 'nest-rdbms-starter');
export const TEST_DB = 'university_test';

/** DATABASE_URL from the environment or .env (the development database). */
export function devDatabaseUrl(): string {
  if (process.env.DEV_DATABASE_URL) return process.env.DEV_DATABASE_URL;
  const envFile = resolve(ROOT, '.env');
  if (existsSync(envFile)) {
    const line = readFileSync(envFile, 'utf8')
      .split(/\r?\n/)
      .find((l) => l.startsWith('DATABASE_URL='));
    if (line) return line.slice('DATABASE_URL='.length).trim();
  }
  return 'postgres://postgres:postgres@localhost:5432/university';
}

function withDatabase(url: string, db: string): string {
  const u = new URL(url);
  u.pathname = `/${db}`;
  return u.toString();
}

export const testDatabaseUrl = () => withDatabase(devDatabaseUrl(), TEST_DB);
export const adminDatabaseUrl = () => withDatabase(devDatabaseUrl(), 'postgres');

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  url = testDatabaseUrl(),
): Promise<T[]> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return (await client.query<T>(sql, params)).rows;
  } finally {
    await client.end();
  }
}

/** Loads the compiled CLI DataSource (dist/) pointed at the test database. */
export async function cliDataSource() {
  process.env.DATABASE_URL = testDatabaseUrl();
  const mod = await import(resolve(ROOT, 'dist/database/data-source.js'));
  const ds = mod.default as import('typeorm').DataSource;
  if (!ds.isInitialized) await ds.initialize();
  return ds;
}

/** Empty test database -> all migrations -> seed data. */
export async function resetDatabase({ seed = true } = {}) {
  const ds = await cliDataSource();
  await ds.dropDatabase();
  await ds.runMigrations();
  await ds.destroy();
  if (seed) runSeed();
}

export function runSeed() {
  execFileSync(process.execPath, [resolve(ROOT, 'scripts/seed.mjs')], {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
    stdio: 'pipe',
  });
}
