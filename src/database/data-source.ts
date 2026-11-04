// Standalone DataSource for the TypeORM CLI (npm run migration:*).
// The CLI runs against the compiled build in dist/, see package.json scripts.
import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';

// #region datasource-cli
if (existsSync('.env')) process.loadEnvFile('.env'); // does not override real env vars

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [`${import.meta.dirname}/../university/*.entity.js`],
  migrations: [`${import.meta.dirname}/../migrations/*.js`],
});
// #endregion datasource-cli
