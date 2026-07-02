import { test, expect } from './fixtures';

/**
 * Campaign list filtering & sorting (the CampaignsSearch component).
 * Guards the fixes for: tag picker never loading, tag filtering being a no-op,
 * and basic search/sort.
 */

async function openFilters(page) {
  // Wait for hydration + initial data (a campaign card) so the toggle's Svelte
  // click handler is actually attached — clicking pre-hydration is a no-op.
  await expect(page.locator('h2').first()).toBeVisible({ timeout: 20_000 });
  const panel = page.locator('.search-container');
  const toggle = page.getByRole('button', { name: /Search & Filter/i });
  for (let i = 0; i < 3 && !(await panel.isVisible()); i++) {
    await toggle.click();
    await page.waitForTimeout(400);
  }
  await expect(panel).toBeVisible({ timeout: 5_000 });
}

test('tag picker loads (not stuck on "Loading tags...")', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await openFilters(page);
  await expect(page.getByRole('button', { name: 'environment' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Loading tags/i)).toHaveCount(0);
});

test('search filters the list by title', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await openFilters(page);
  // "Barclays" is NOT in the default top-5 view, so it only appears via search.
  await page.locator('#search-term').fill('Barclays');
  await page.getByRole('button', { name: /^Search$/ }).click();
  await expect(page.getByText(/Barclays/i).first()).toBeVisible({ timeout: 15_000 });
});

test('tag filter narrows the list to that tag', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await openFilters(page);
  // "consumer" is on Amazon/Barclays/Air France/HSBC but not Baltimore (politics).
  await page.getByRole('button', { name: 'consumer' }).click();
  await page.getByRole('button', { name: /Apply Filters/i }).click();
  await expect(page.getByText(/Amazon/i).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Baltimore Open Legislation')).toHaveCount(0);
});

test('changing sort does not break the list', async ({ page, errors }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await openFilters(page);
  await page.locator('#sort-by').selectOption('title');
  await page.getByRole('button', { name: /Apply Filters/i }).click();
  await expect(page.locator('h2').first()).toBeVisible({ timeout: 15_000 });
  expect(errors, `browser errors:\n${errors.join('\n')}`).toEqual([]);
});
