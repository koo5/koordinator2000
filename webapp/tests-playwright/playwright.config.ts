import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Playwright config for the Koordinator webapp.
 * Conventions mirror the hillview project: a standalone tests-playwright package,
 * run with bun, single worker, html reporter, and a webServer that reuses a
 * running dev server. The app needs the local data plane (Postgres + Hasura,
 * see docs/INFRA.md) up, since it fetches campaigns from Hasura.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5533',
    trace: 'on-first-retry',
    navigationTimeout: 30_000,
  },
  timeout: 60_000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  /* Reuse a running `bun run dev`; start one if absent. */
  webServer: {
    command: 'bun run dev',
    cwd: path.resolve(__dirname, '..'),
    url: process.env.FRONTEND_URL || 'http://localhost:5533',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
