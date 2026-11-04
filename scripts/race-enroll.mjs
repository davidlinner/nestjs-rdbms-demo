// npm run race:enroll -- <courseId>
// Homework H2 self-check: 20 students try to enroll in a course with capacity 10
// at the same time. A correct implementation accepts exactly 10.
//
// The script resets the course on every run (removes its enrollments, sets
// capacity to 10) and creates 20 race students if they don't exist yet.
// Expects your app on APP_URL (default http://localhost:3000) with
// POST /courses/:id/enrollments { "studentId": number } -> 201 | 409 | 404.
import pg from 'pg';

const courseId = Number(process.argv[2]);
if (!Number.isInteger(courseId) || courseId < 1) {
  console.error('Usage: npm run race:enroll -- <courseId>');
  process.exit(1);
}
const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
const RACERS = 20;
const CAPACITY = 10;

const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  const course = await db.query('SELECT id FROM course WHERE id = $1', [courseId]);
  if (course.rowCount === 0) {
    console.error(`Course ${courseId} does not exist. Run npm run db:seed first?`);
    process.exit(1);
  }

  // Prepare: race students, empty course, capacity 10
  const studentIds = [];
  for (let i = 1; i <= RACERS; i++) {
    const n = String(i).padStart(2, '0');
    const { rows } = await db.query(
      `INSERT INTO student ("firstName", "lastName", email)
       VALUES ('Race', $1, $2)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id`,
      [`Runner ${n}`, `race-${n}@example.edu`],
    );
    studentIds.push(rows[0].id);
  }
  await db.query('DELETE FROM enrollment WHERE "courseId" = $1', [courseId]);
  await db.query('UPDATE course SET capacity = $1 WHERE id = $2', [CAPACITY, courseId]);

  // Fire all requests at once
  const statuses = await Promise.all(
    studentIds.map(async (studentId) => {
      try {
        const res = await fetch(`${appUrl}/courses/${courseId}/enrollments`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ studentId }),
        });
        return res.status;
      } catch {
        return 'no connection';
      }
    }),
  );

  const counts = {};
  for (const status of statuses) counts[status] = (counts[status] ?? 0) + 1;
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS n FROM enrollment WHERE "courseId" = $1',
    [courseId],
  );

  console.log(`Responses: ${JSON.stringify(counts)}`);
  console.log(`Enrollments in course ${courseId}: ${rows[0].n} (capacity ${CAPACITY})`);
  const ok = counts[201] === CAPACITY && counts[409] === RACERS - CAPACITY && rows[0].n === CAPACITY;
  console.log(ok ? 'PASS: exactly 10 enrollments accepted.' : 'FAIL: expected 10 x 201, 10 x 409 and 10 enrollments.');
  process.exitCode = ok ? 0 : 1;
} finally {
  await db.end();
}
