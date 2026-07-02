import { test as base, expect } from '@playwright/test';

/**
 * Shared fixtures. Import { test, expect } from './fixtures' instead of
 * '@playwright/test'. Every test gets a page that collects browser console
 * errors and uncaught exceptions into `page.__errors` so specs can assert the
 * UI booted clean. Set PLAYWRIGHT_CONSOLE_LOG=1 to also stream them to stdout.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(`[console.error] ${msg.text()}`);
        if (process.env.PLAYWRIGHT_CONSOLE_LOG) console.log('BROWSER:', msg.text());
      }
    });
    page.on('pageerror', err => {
      errors.push(`[pageerror] ${err.message}`);
      if (process.env.PLAYWRIGHT_CONSOLE_LOG) console.log('PAGEERROR:', err.message);
    });
    await use(errors);
  },
});

export { expect };
