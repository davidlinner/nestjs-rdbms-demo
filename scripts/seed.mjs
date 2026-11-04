// npm run db:seed - loads seed/seed.sql into the database from DATABASE_URL.
// Works with the Docker Compose database and with hosted PostgreSQL.
import { readFileSync } from 'node:fs';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env first.');
  process.exit(1);
}

const sql = readFileSync(new URL('../seed/seed.sql', import.meta.url), 'utf8');
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  const { rows } = await client.query(
    "SELECT to_regclass('public.enrollment') IS NOT NULL AS ready",
  );
  if (!rows[0].ready) {
    console.error(
      'Schema not found: start the app with your block-1 entities first, then run db:seed again.',
    );
    process.exitCode = 1;
  } else {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Seed data loaded: 3 lecturers, 5 courses, 8 students, 17 enrollments.');
  }
} catch (error) {
  await client.query('ROLLBACK').catch(() => undefined);
  console.error(`Seeding failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
