// Spec: Homework support - race script against the H2 reference solution
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { createTestApp, type TestApp } from './app.js';
import { query, resetDatabase, ROOT, testDatabaseUrl } from './db.js';

const run = promisify(execFile);

describe('H2 race: 20 parallel enrollments, capacity 10', () => {
  let t: TestApp;

  beforeAll(async () => {
    await resetDatabase();
    t = await createTestApp({ listen: true });
  });
  afterAll(() => t?.close());

  it.each([1, 2])('run %i: exactly 10 x 201 and 10 x 409', async () => {
    const { stdout } = await run(
      process.execPath,
      [resolve(ROOT, 'scripts/race-enroll.mjs'), '5'],
      {
        env: {
          ...process.env,
          DATABASE_URL: testDatabaseUrl(),
          APP_URL: (await t.app.getUrl()).replace('[::1]', 'localhost'),
        },
      },
    );
    expect(stdout).toContain('Responses: {"201":10,"409":10}');
    expect(stdout).toContain('PASS');
    const [row] = await query<{ n: number }>(
      'SELECT COUNT(*)::int AS n FROM enrollment WHERE "courseId" = 5',
    );
    expect(row.n).toBe(10);
  });
});
