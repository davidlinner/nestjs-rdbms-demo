// Spec: Seed data
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { query, resetDatabase, ROOT, runSeed, STARTER, TEST_DB, testDatabaseUrl } from './db.js';

const counts = async () =>
  (
    await query<{ c: string }>(
      `SELECT concat_ws(',',
         (SELECT count(*) FROM lecturer), (SELECT count(*) FROM course),
         (SELECT count(*) FROM student), (SELECT count(*) FROM student_card),
         (SELECT count(*) FROM enrollment),
         (SELECT count(*) FROM enrollment WHERE grade IS NULL)) AS c`,
    )
  )[0].c;

describe('seed data', () => {
  beforeAll(() => resetDatabase({ seed: false }));

  it('loads the dataset and can be repeated', async () => {
    runSeed();
    runSeed();
    expect(await counts()).toBe('3,5,8,8,17,1');
  });

  it('matches the grades per course from the concept', async () => {
    const rows = await query<{ row: string }>(
      `SELECT c.title || ':' || string_agg(coalesce(e.grade::text, 'NULL'), ',' ORDER BY e.id) AS row
       FROM course c JOIN enrollment e ON e."courseId" = c.id
       GROUP BY c.id ORDER BY c.id`,
    );
    expect(rows.map((r) => r.row)).toEqual([
      'Databases:1.3,1.7,2.0,1.0',
      'Web Engineering:2.3,2.7,1.7',
      'Algorithms:1.0,1.3,2.0,2.3,1.7',
      'Distributed Systems:3.0,2.7',
      'Compilers:1.7,1.3,NULL',
    ]);
  });

  it('continues id sequences after the explicit ids', async () => {
    const [row] = await query<{ id: number }>(
      `INSERT INTO lecturer (name, email) VALUES ('New', 'new@uni.example') RETURNING id`,
    );
    expect(row.id).toBe(4);
    runSeed();
  });

  it('refuses to seed a database without schema, with an explanation', async () => {
    const empty = testDatabaseUrl().replace(`/${TEST_DB}`, '/university_test_empty');
    const admin = testDatabaseUrl().replace(`/${TEST_DB}`, '/postgres');
    await query('DROP DATABASE IF EXISTS university_test_empty', [], admin);
    await query('CREATE DATABASE university_test_empty', [], admin);
    try {
      let output = '';
      try {
        execFileSync(process.execPath, [resolve(ROOT, 'scripts/seed.mjs')], {
          env: { ...process.env, DATABASE_URL: empty },
          stdio: 'pipe',
        });
      } catch (error) {
        output = String((error as { stderr: Buffer }).stderr);
      }
      expect(output).toContain('Schema not found');
    } finally {
      await query('DROP DATABASE IF EXISTS university_test_empty', [], admin);
    }
  });

  it.skipIf(!existsSync(STARTER))('seed file is identical to the starter', () => {
    for (const file of ['seed/seed.sql', 'scripts/seed.mjs']) {
      expect(readFileSync(resolve(STARTER, file), 'utf8')).toBe(
        readFileSync(resolve(ROOT, file), 'utf8'),
      );
    }
  });
});
