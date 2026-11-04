// Spec: Domain model, Schema managed by migrations
import { cliDataSource, query, resetDatabase } from './db.js';

describe('schema created by migrations', () => {
  beforeAll(() => resetDatabase());

  it('contains exactly the domain tables and the migrations table', async () => {
    const rows = await query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`,
    );
    expect(rows.map((r) => r.table_name)).toEqual([
      'course',
      'enrollment',
      'lecturer',
      'migrations',
      'student',
      'student_card',
    ]);
  });

  it('has the foreign keys with TypeORM default naming', async () => {
    const rows = await query<{ fk: string }>(
      `SELECT tc.table_name || '.' || kcu.column_name || ' -> ' || ccu.table_name AS fk
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
       WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' ORDER BY fk`,
    );
    expect(rows.map((r) => r.fk)).toEqual([
      'course.lecturerId -> lecturer',
      'enrollment.courseId -> course',
      'enrollment.studentId -> student',
      'student_card.studentId -> student',
    ]);
  });

  it('has the unique constraints', async () => {
    const rows = await query<{ uq: string }>(
      `SELECT tc.table_name || '(' || string_agg(kcu.column_name, ',' ORDER BY kcu.column_name) || ')' AS uq
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
       WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
       GROUP BY tc.table_name, tc.constraint_name ORDER BY uq`,
    );
    expect(rows.map((r) => r.uq)).toEqual([
      'enrollment(courseId,studentId)',
      'lecturer(email)',
      'student(email)',
      'student_card(cardNumber)',
      'student_card(studentId)',
    ]);
  });

  it('defaults course capacity to 30 (needed for the U9 data-loss demo)', async () => {
    const [row] = await query<{ column_default: string }>(
      `SELECT column_default FROM information_schema.columns
       WHERE table_name = 'course' AND column_name = 'capacity'`,
    );
    expect(row.column_default).toContain('30');
  });

  it('rejects a duplicate enrollment', async () => {
    await expect(
      query('INSERT INTO enrollment ("studentId", "courseId") VALUES (1, 1)'),
    ).rejects.toThrow(/unique constraint/i);
  });

  it('has no pending schema changes (migration:generate would find nothing)', async () => {
    const ds = await cliDataSource();
    try {
      const sql = await ds.driver.createSchemaBuilder().log();
      expect(sql.upQueries).toEqual([]);
    } finally {
      await ds.destroy();
    }
  });
});
