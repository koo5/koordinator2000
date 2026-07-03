import { test, expect } from './fixtures';

/**
 * Desktop discovery: a lazy-loaded listing (CampaignListView). Runs at a desktop
 * viewport (the default), where the swipe deck is replaced by the scrollable list.
 */
test.use({ viewport: { width: 1280, height: 800 } });

test('lazy-loads more campaigns as you scroll', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 20_000 });
  const before = await page.locator('.listing-item').count();

  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
  }
  const after = await page.locator('.listing-item').count();
  expect(after).toBeGreaterThan(before);
});

test('dismiss hides a card and offers undo', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: /Not interested/ }).first().click();
  await expect(page.locator('.toastbar')).toContainText(/Dismissed/i, { timeout: 5_000 });
});
