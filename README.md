# Demo: Using SQL Databases from NestJS

Instructor-side reference project for the class. It contains the **final state** of the session's live coding. The slides import their code from here by named region. Students never get this project; they work in the sibling project `nest-rdbms-starter`, which contains no solutions.

Contract and didactic background: `../nest-rdbms/concept/teaching-concept.md` (section 13).

## Start

```bash
cp .env.example .env
docker compose up -d          # PostgreSQL 17, database "university", port 5432
npm ci
npm run migration:run         # creates the schema
npm run db:seed               # example data (repeatable)
npm run start:dev             # http://localhost:3000
```

The demo and the starter both use port 5432. Stop one database (`docker compose stop`) before starting the other.

## Scripts

| Script | Purpose |
|---|---|
| `npm run start:dev` | Start with watch mode; SQL queries are logged (part of the teaching) |
| `npm run build` | Compile to `dist/` |
| `npm run migration:generate -- src/migrations/<Name>` | Build, then generate a migration from the entity changes |
| `npm run migration:run` | Build, then run pending migrations |
| `npm run migration:revert` | Build, then revert the last migration |
| `npm run typeorm -- <command>` | Any TypeORM CLI command against the compiled data source |
| `npm run db:seed` | Load or reset the seed data (`seed/seed.sql`) |
| `npm run race:enroll -- <courseId>` | Homework H2 self-check: 20 parallel enrollments, capacity 10 |
| `npm run test:e2e` | Verify the whole contract against the running database (see below) |
| `npm test` | Unit tests (none; the demo is verified end-to-end) |

## Endpoints

| Method and path | Used in | Region |
|---|---|---|
| `GET /health` | U1, setup check | `health-raw-pg` |
| `GET` / `POST /students` | U3 | `students-service-basic` |
| `GET /lecturers/with-courses` | U6 | `repo-find-with-relations` |
| `GET /courses/:id/students` | U7 | `qb-students-by-course` |
| `GET /courses/enrollment-counts` | U7 | `qb-enrollment-count` |
| `GET /courses?page=&pageSize=` | U7 | `qb-pagination` |
| `GET /reports/courses?maxAvg=&limit=&offset=` | U8 (Exercise 2 solution) | `qb-report-courses` |
| `POST /enrollments/change-course` `{studentId, fromCourseId, toCourseId}` | U10 | `tx-change-course` |
| `GET /homework/students-with-cards` | H3 (deliberate N+1) | — |
| `POST /courses/:id/enrollments` `{studentId}` | H2 reference solution, instructor only | — |

## Code regions for slides

Slides import code with `<<< @demo/<path>#<region>` (the slides' `DEMO_DIR` defaults to this folder). Regions are marked in the source:

```ts
// #region entity-student
...
// #endregion entity-student
```

Rules:
- The list of regions is the contract: `test/contract-regions.json`. The e2e tests fail if a region is missing, duplicated, unclosed, or not in the list.
- Regions may nest (`datasource-config` contains `pool-options`; `entity-student` contains `relation-student-enrollments`). Nested markers are hidden on the slides.
- Entities are ordered header, primary key, columns, relations. An earlier slide that only shows the columns highlights those lines, and the relations appear dimmed.
- Code that *contradicts* the final state (e.g. `synchronize: true`, the plain `@ManyToMany`) is not in this project. The slides show it inline as an intermediate step.
- After changing code here, run `npm run test:e2e` here and `npm run check` in `../nest-rdbms/slides`.

## Verifying the contract

```bash
docker compose up -d
npm run test:e2e
```

The tests build the app, create the separate database `university_test` (the development data stays untouched), and check:
- the schema created by migrations, and migrating up, down and up again
- seeding, the exact Exercise 2 results, and the change-course transaction including its rollback
- query counts (1 for `with-courses`, 1 + 8 for the H3 endpoint), and the H2 race (10 × 201, 10 × 409)
- the code regions, and that the files shared with the starter are byte-identical (skipped if `../nest-rdbms-starter` is absent)

## Notes on NestJS 12 / TypeORM 1.x (found while building)

These are worth knowing when preparing slides, because many tutorials show older setups.

- **ESM project.** The Nest 12 template is ESM (`"type": "module"`). Relative imports need the `.js` suffix, and paths use `import.meta.dirname` instead of `__dirname`.
- **`Relation<…>` for relation properties.** With ESM, circular entity imports (Course ↔ Enrollment) fail at runtime unless relation properties are typed as `Relation<Course>`. That's TypeORM's documented solution; worth a callout on the entities slides.
- **The TypeORM CLI runs against the compiled build.** Node can't import decorator-based `.ts` files directly, and the template has no `ts-node`. So the `migration:*` scripts run `nest build` first and then `typeorm -d dist/database/data-source.js`. Migrations are generated as `.ts` into `src/migrations/` and compiled with the app.
- **`.env` in the CLI data source** is loaded with Node's `process.loadEnvFile` (no `dotenv` needed). `db:seed` and `race:enroll` use `node --env-file-if-exists=.env`.
- **Tests use Vitest** (the Nest 12 template default), not Jest. The e2e tests boot the compiled `AppModule` from `dist/`.
- **`findOneBy` with a relation condition runs two queries** (a DISTINCT-id query because of the implicit `LIMIT 1`, then the data). The H3 endpoint uses `findBy`, so its N+1 is exactly 1 + N.
- **`skip`/`take` with a join** (`qb-pagination`) runs three queries: count, distinct ids, data. That's expected TypeORM behaviour for paginating joined entities, and worth a sentence on the slide.
- PostgreSQL `numeric` and `COUNT` values arrive as **strings** (`"1.50"`, `"3"`).
