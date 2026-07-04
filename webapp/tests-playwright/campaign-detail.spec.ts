import { test, expect } from './fixtures';

/**
 * Campaign detail page: renders the campaign and the core participation control
 * (set a threshold + Participate). This is the heart of the app.
 */
test('campaign detail renders title, description and participation control', async ({ page }) => {
  await page.goto('/campaign/11', { waitUntil: 'domcontentloaded' });

  // Title (from the restored data) and description hydrate from Hasura.
  await expect(page.getByRole('heading', { name: /Baltimore Open Legislation/i }))
    .toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/I'll join if/i).first()).toBeVisible();

  // The core mechanic: a Pledge affordance is present.
  await expect(page.getByRole('button', { name: /Pledge/ }).first()).toBeVisible();
});
