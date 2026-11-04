// Boots the compiled AppModule against the test database and counts SQL queries.
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { resolve } from 'node:path';
import type { DataSource, Logger } from 'typeorm';
import { ROOT, testDatabaseUrl } from './db.js';

/** TypeORM logger that counts queries instead of printing them. */
export class CountingLogger implements Logger {
  count = 0;
  logQuery() {
    this.count++;
  }
  logQueryError() {}
  logQuerySlow() {}
  logSchemaBuild() {}
  logMigration() {}
  log() {}
}

export interface TestApp {
  app: INestApplication;
  dataSource: DataSource;
  queries: CountingLogger;
  close(): Promise<void>;
}

export async function createTestApp({ listen = false } = {}): Promise<TestApp> {
  process.env.DATABASE_URL = testDatabaseUrl();
  const { AppModule } = await import(resolve(ROOT, 'dist/app.module.js'));
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  if (listen) await app.listen(0);
  else await app.init();

  // Swap the query logger: counts queries and keeps test output quiet.
  const { DataSource } = await import('typeorm');
  const dataSource = app.get(DataSource);
  const queries = new CountingLogger();
  (dataSource as unknown as { logger: Logger }).logger = queries;

  return { app, dataSource, queries, close: () => app.close() };
}
