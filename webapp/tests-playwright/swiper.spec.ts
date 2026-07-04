import { test, expect } from './fixtures';

/**
 * Reels-style campaign discovery (CampaignSwiper). An anonymous account is
 * created on load, so pledge/dismiss go through the user-role client + the
 * participations/campaign_dismissals permissions.
 *
 * The swipe deck is the MOBILE view (desktop gets the lazy list), so run these
 * at a mobile viewport.
 */
test.use({ viewport: { width: 390, height: 820 }, isMobile: true, hasTouch: true });

test('pledge advances to the next card and shows the undo bar', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.kcard.top h3').first()).toBeVisible({ timeout: 20_000 });
  const first = (await page.locator('.kcard.top h3').first().innerText()).trim();

  await page.getByRole('button', { name: /I'm in/ }).click();
  await expect(page.locator('.toastbar')).toContainText(/Pledged/i, { timeout: 5_000 });
  // The deck moved on.
  await expect(page.locator('.kcard.top h3').first()).not.toHaveText(first, { timeout: 5_000 });
});

test('dismiss shows the undo bar', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.kcard.top h3').first()).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: '✕' }).click();
  await expect(page.locator('.toastbar')).toContainText(/Dismissed/i, { timeout: 5_000 });
});

test('bulk: escalate a dismiss to "all of this cause"', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.kcard.top h3').first()).toBeVisible({ timeout: 20_000 });

  // Search-filter to a campaign with a seeded cause (deterministic — the deck's
  // default order shifts as other tests pledge campaigns up).
  await page.locator('#search-term').fill('Amazon');
  await page.getByRole('button', { name: /^Search$/ }).click();
  await expect(page.locator('.kcard.top h3').first()).toContainText(/Amazon/i, { timeout: 15_000 });

  await page.getByRole('button', { name: '✕' }).click();
  const bulk = page.getByRole('button', { name: /Dismiss all of/i });
  await expect(bulk).toBeVisible({ timeout: 5_000 });
  await bulk.click();
  await expect(page.locator('.toastbar')).toContainText(/Dismissed all \d+ of/i, { timeout: 5_000 });
});
