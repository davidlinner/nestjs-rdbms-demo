// Spec: Code regions for slides, plus files that must be identical in the starter
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ROOT, STARTER } from './db.js';

const contract: string[] = JSON.parse(
  readFileSync(resolve(ROOT, 'test/contract-regions.json'), 'utf8'),
);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith('.ts') ? [path] : [];
  });
}

const RE_START = /^\s*\/\/\s*#region\s+([\w-]+)\s*$/;
const RE_END = /^\s*\/\/\s*#endregion\s+([\w-]+)\s*$/;

const starts = new Map<string, string[]>();
const ends = new Map<string, string[]>();
for (const file of sourceFiles(resolve(ROOT, 'src'))) {
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const s = RE_START.exec(line)?.[1];
    const e = RE_END.exec(line)?.[1];
    if (s) starts.set(s, [...(starts.get(s) ?? []), file]);
    if (e) ends.set(e, [...(ends.get(e) ?? []), file]);
  }
}

describe('contract regions', () => {
  it.each(contract)('%s exists exactly once and is closed in the same file', (name) => {
    expect(starts.get(name), `region ${name} not found`).toHaveLength(1);
    expect(ends.get(name), `region ${name} not closed`).toEqual(starts.get(name));
  });

  it('has no regions outside the contract', () => {
    expect([...starts.keys()].filter((name) => !contract.includes(name))).toEqual([]);
  });
});

describe.skipIf(!existsSync(STARTER))('files identical in the starter', () => {
  it.each([
    ['src/health/health.controller.ts', 'src/health/health.controller.ts'],
    ['src/homework/students-with-cards.controller.ts', 'homework/students-with-cards.controller.ts'],
    ['scripts/race-enroll.mjs', 'scripts/race-enroll.mjs'],
    ['docker-compose.yml', 'docker-compose.yml'],
    ['.env.example', '.env.example'],
  ])('%s', (demoPath, starterPath) => {
    expect(readFileSync(resolve(STARTER, starterPath), 'utf8')).toBe(
      readFileSync(resolve(ROOT, demoPath), 'utf8'),
    );
  });
});
