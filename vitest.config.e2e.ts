import { defineConfig } from 'vitest/config';

// E2e tests verify the demo app contract against the Docker Compose PostgreSQL.
// They run against the compiled app in dist/ (built in global setup) and use the
// separate database "university_test", one suite at a time.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
