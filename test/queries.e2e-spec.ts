// Spec: Session endpoints (single query), Homework support (observable N+1)
import request from 'supertest';
import { createTestApp, type TestApp } from './app.js';
import { resetDatabase } from './db.js';

describe('queries per request', () => {
  let t: TestApp;

  beforeAll(async () => {
    await resetDatabase();
    t = await createTestApp();
  });
  afterAll(() => t?.close());

  const countQueries = async (path: string) => {
    t.queries.count = 0;
    await request(t.app.getHttpServer()).get(path).expect(200);
    return t.queries.count;
  };

  it('GET /lecturers/with-courses uses exactly one query', async () => {
    expect(await countQueries('/lecturers/with-courses')).toBe(1);
  });

  it('GET /homework/students-with-cards has the deliberate N+1 (1 + 8 students)', async () => {
    expect(await countQueries('/homework/students-with-cards')).toBe(9);
  });

  it('GET /reports/courses uses exactly one query', async () => {
    expect(await countQueries('/reports/courses?maxAvg=2.0&limit=2&offset=0')).toBe(1);
  });
});
