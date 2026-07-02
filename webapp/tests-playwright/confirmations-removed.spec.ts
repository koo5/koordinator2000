import { test, expect } from './fixtures';

/**
 * Regression guard for the participation-confirmations teardown.
 * The feature (collect_confirmations flag + confirmed field + "confirm your
 * participation" flow) was removed; these assertions fail if it creeps back.
 */

test('add-campaign form has no "collect confirmations" toggle', async ({ page }) => {
  await page.goto('/add_campaign', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/collect confirmations/i)).toHaveCount(0);
  await expect(page.locator('#collect_confirmations')).toHaveCount(0);
});

test('campaign progress shows "participating", not confirmed/unconfirmed', async ({ page }) => {
  // "11" is a valid (numeric) slug for the Baltimore Open Legislation campaign.
  await page.goto('/campaign/11', { waitUntil: 'domcontentloaded' });
  // Wait for the campaign to hydrate from Hasura.
  await expect(page.getByText(/participating/i).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/unconfirmed/i)).toHaveCount(0);
  await expect(page.getByText(/waiting for confirmation/i)).toHaveCount(0);
});
