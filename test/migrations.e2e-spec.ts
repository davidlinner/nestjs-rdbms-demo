// Spec: Schema managed by migrations - lifecycle run / revert / run
import { cliDataSource, query } from './db.js';

const domainTables = async () =>
  (
    await query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name <> 'migrations'`,
    )
  ).length;

describe('migration lifecycle', () => {
  it('runs, reverts and runs again on an empty database', async () => {
    const ds = await cliDataSource();
    try {
      await ds.dropDatabase();

      const ran = await ds.runMigrations();
      expect(ran.map((m) => m.name)).toEqual([expect.stringMatching(/^InitialSchema\d+$/)]);
      expect(await domainTables()).toBe(5);

      await ds.undoLastMigration();
      expect(await domainTables()).toBe(0);
      expect(await query('SELECT * FROM migrations')).toHaveLength(0);

      await ds.runMigrations();
      expect(await domainTables()).toBe(5);
      expect(await query('SELECT * FROM migrations')).toHaveLength(1);
    } finally {
      await ds.destroy();
    }
  });
});
