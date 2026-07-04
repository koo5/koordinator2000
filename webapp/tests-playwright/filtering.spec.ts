import { test, expect } from './fixtures';

/**
 * Campaign discovery toolbar (the CampaignsSearch component): search + sort +
 * tag chips, always visible, immediate-apply (no "Apply Filters" step).
 */

async function waitForToolbar(page) {
  // Wait for hydration + initial data so control handlers are attached —
  // pre-hydration clicks silently no-op.
  await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#search-term')).toBeVisible();
}

test('tag chips load (not stuck on "Loading tags...")', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await waitForToolbar(page);
  await expect(page.getByRole('button', { name: 'environment' })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Loading tags/i)).toHaveCount(0);
});

test('search filters the list by title', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await waitForToolbar(page);
  // "Barclays" is NOT in the default first page, so it only appears via search.
  await page.locator('#search-term').fill('Barclays');
  await page.getByRole('button', { name: /^Search$/ }).click();
  await expect(page.getByText(/Barclays/i).first()).toBeVisible({ timeout: 15_000 });
});

test('tag filter applies immediately and narrows the list', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await waitForToolbar(page);
  // "consumer" is on Amazon/Barclays/Air France/HSBC but not Baltimore (politics).
  await page.getByRole('button', { name: 'consumer' }).click();
  await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Baltimore Open Legislation')).toHaveCount(0);
});

test('changing sort applies immediately', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await waitForToolbar(page);
  await page.locator('#sort-by').selectOption('title');
  // The list still renders after re-sorting.
  await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 15_000 });
});
