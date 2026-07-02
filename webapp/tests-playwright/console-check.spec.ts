import { test, expect } from './fixtures';

/**
 * The app boots without uncaught exceptions or console errors on the main
 * pages. Cheap, high-signal feedback that a change didn't break the UI at
 * runtime (SSR/hydration errors, missing GraphQL fields, etc.).
 */
test('no console errors or uncaught exceptions on core pages', async ({ page, errors }) => {
  for (const path of ['/', '/campaigns', '/add_campaign']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500); // let client-side GraphQL settle
  }
  expect(errors, `browser errors:\n${errors.join('\n')}`).toEqual([]);
});
