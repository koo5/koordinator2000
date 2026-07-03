import { test, expect } from './fixtures';

/**
 * The app boots without uncaught exceptions or console errors on the main
 * pages. Cheap, high-signal feedback that a change didn't break the UI at
 * runtime (SSR/hydration errors, missing GraphQL fields, etc.).
 */
// Transient/environmental noise that doesn't indicate an app defect: a WS blip
// during navigation, an aborted/failed resource fetch, external CDN assets
// (firepad/firebase), favicon. Real defects (SSR/hydration errors, GraphQL
// "field not found", ReferenceErrors) are not filtered.
const BENIGN = /Failed to load resource|WebSocket|net::ERR|ERR_ABORTED|firepad|firebase|jsdelivr|cdn\.|favicon/i;

test('no real console errors or uncaught exceptions on core pages', async ({ page, errors }) => {
  for (const path of ['/', '/campaigns', '/add_campaign']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500); // let client-side GraphQL settle
  }
  const real = errors.filter(e => !BENIGN.test(e));
  expect(real, `unexpected browser errors:\n${real.join('\n')}`).toEqual([]);
});
