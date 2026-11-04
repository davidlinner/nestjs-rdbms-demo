// Spec: Session endpoints and queries, Exercise 2 expected results
import request from 'supertest';
import { createTestApp, type TestApp } from './app.js';
import { query, resetDatabase } from './db.js';

describe('session endpoints', () => {
  let t: TestApp;
  const http = () => request(t.app.getHttpServer());

  beforeAll(async () => {
    await resetDatabase();
    t = await createTestApp();
  });
  afterAll(() => t?.close());

  it('GET /health reports PostgreSQL 17 via raw pg', async () => {
    const res = await http().get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.postgres).toMatch(/^PostgreSQL 17/);
  });

  it('GET and POST /students', async () => {
    const list = await http().get('/students').expect(200);
    expect(list.body).toHaveLength(8);
    expect(list.body[0].lastName).toBe('Becker');
    const created = await http()
      .post('/students')
      .send({ firstName: 'Ada', lastName: 'Test', email: 'ada.test@student.example' })
      .expect(201);
    expect(created.body.id).toBe(9);
  });

  it('GET /lecturers/with-courses includes courses sorted by title', async () => {
    const res = await http().get('/lecturers/with-courses').expect(200);
    const codd = res.body.find((l: { name: string }) => l.name === 'Edgar Codd');
    expect(codd.courses.map((c: { title: string }) => c.title)).toEqual([
      'Databases',
      'Distributed Systems',
    ]);
  });

  it('query builder: students by course, enrollment counts, pagination', async () => {
    const students = await http().get('/courses/1/students').expect(200);
    expect(students.body.map((s: { lastName: string }) => s.lastName)).toEqual([
      'Becker',
      'Hoffmann',
      'Schulz',
      'Wagner',
    ]);

    const counts = await http().get('/courses/enrollment-counts').expect(200);
    expect(counts.body).toEqual([
      { title: 'Algorithms', enrollments: '5' },
      { title: 'Compilers', enrollments: '3' },
      { title: 'Databases', enrollments: '4' },
      { title: 'Distributed Systems', enrollments: '2' },
      { title: 'Web Engineering', enrollments: '3' },
    ]);

    const page = await http().get('/courses?page=2&pageSize=2').expect(200);
    expect(page.body.total).toBe(5);
    expect(page.body.items.map((c: { title: string }) => c.title)).toEqual([
      'Databases',
      'Distributed Systems',
    ]);
    expect(page.body.items[0].lecturer.name).toBe('Edgar Codd');
  });

  describe('Exercise 2: GET /reports/courses', () => {
    it('first page', async () => {
      const res = await http()
        .get('/reports/courses?maxAvg=2.0&limit=2&offset=0')
        .expect(200);
      expect(res.body).toEqual([
        { title: 'Compilers', lecturer: 'Grace Hopper', avgGrade: '1.50', enrollments: '3' },
        { title: 'Databases', lecturer: 'Edgar Codd', avgGrade: '1.50', enrollments: '4' },
      ]);
    });

    it('second page', async () => {
      const res = await http()
        .get('/reports/courses?maxAvg=2.0&limit=2&offset=2')
        .expect(200);
      expect(res.body).toEqual([
        { title: 'Algorithms', lecturer: 'Ada Lovelace', avgGrade: '1.66', enrollments: '5' },
      ]);
    });
  });

  describe('transaction: change course', () => {
    const enrolledIn = async (studentId: number) =>
      (
        await query<{ courseId: number }>(
          'SELECT "courseId" FROM enrollment WHERE "studentId" = $1 ORDER BY "courseId"',
          [studentId],
        )
      ).map((r) => r.courseId);

    it('moves a student atomically', async () => {
      await http()
        .post('/enrollments/change-course')
        .send({ studentId: 2, fromCourseId: 1, toCourseId: 2 })
        .expect(201);
      expect(await enrolledIn(2)).toEqual([2, 3]);
    });

    it('rolls back the delete when the insert fails', async () => {
      await http()
        .post('/enrollments/change-course')
        .send({ studentId: 1, fromCourseId: 1, toCourseId: 3 }) // already in 3
        .expect(409);
      expect(await enrolledIn(1)).toEqual([1, 3, 5]);
    });

    it('returns 404 when the student is not in the source course', async () => {
      await http()
        .post('/enrollments/change-course')
        .send({ studentId: 1, fromCourseId: 4, toCourseId: 2 })
        .expect(404);
    });
  });
});
