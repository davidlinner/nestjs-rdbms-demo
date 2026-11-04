// Runs once before all e2e suites: checks the database, builds the app,
// and recreates the test database.
import { execSync } from 'node:child_process';
import pg from 'pg';
import { adminDatabaseUrl, ROOT, TEST_DB } from './db.js';

export default async function setup() {
  const client = new pg.Client({ connectionString: adminDatabaseUrl() });
  try {
    await client.connect();
  } catch (error) {
    const reason = (error as { code?: string }).code ?? (error as Error).message;
    throw new Error(
      `PostgreSQL is not reachable at ${new URL(adminDatabaseUrl()).host} (${reason}). ` +
        'Start it with "docker compose up -d" and run the tests again.',
    );
  }
  try {
    await client.query(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`);
    await client.query(`CREATE DATABASE ${TEST_DB}`);
  } finally {
    await client.end();
  }

  // The suites use the compiled app and migrations, like the CLI does.
  execSync('npx nest build', { cwd: ROOT, stdio: 'inherit' });
}
