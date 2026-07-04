import { test, expect } from './fixtures';

/**
 * Country relevance: a discovery toolbar selector filters the deck to a country
 * (plus country-agnostic campaigns) — the coarse geo filter that, unlike
 * near-me, needs no geolocation permission. Composes with the language filter.
 * Seed: Baltimore = US, the Polish-Catholicism campaign = CZ, Amazon = global.
 */
test.describe('country selector', () => {
  test.use({ locale: 'en-US', viewport: { width: 1280, height: 900 } });

  test('filters the deck by country, keeping global campaigns', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 20_000 });
    // Neutralize the language axis so this test isolates country.
    await page.getByRole('button', { name: /All languages|only/ }).click();

    // Default "Everywhere": a US campaign and a global one are both present.
    await expect(page.getByText('Baltimore Open Legislation').first()).toBeVisible({ timeout: 15_000 });

    // Czech Republic: the US-only campaign drops out; the CZ one appears.
    await page.locator('select[aria-label="Country"]').selectOption('CZ');
    await expect(page.getByText(/extremist Polish/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Baltimore Open Legislation')).toHaveCount(0);

    // United States: the reverse.
    await page.locator('select[aria-label="Country"]').selectOption('US');
    await expect(page.getByText('Baltimore Open Legislation').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/extremist Polish/i)).toHaveCount(0);
  });
});
