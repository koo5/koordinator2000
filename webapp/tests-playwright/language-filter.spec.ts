import { test, expect } from './fixtures';

/**
 * Campaign language relevance: the discovery deck defaults to the viewer's UI
 * language (plus language-agnostic campaigns), with a toggle for all languages.
 * Seed data: most campaigns are 'en'; "Air France" and the Polish-Catholicism
 * campaign are 'cs'. ("deck relevance = language + location")
 */
test.describe('czech viewer', () => {
  test.use({ locale: 'cs-CZ', viewport: { width: 1280, height: 900 } });

  test('deck defaults to Czech campaigns, toggle opens it to all languages', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 20_000 });

    // A Czech-language campaign is shown; an English-only one is hidden.
    await expect(page.getByText(/Air France/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Baltimore Open Legislation')).toHaveCount(0);

    // Opening the deck to all languages surfaces the English campaigns.
    await page.getByRole('button', { name: /Všechny jazyky|Jen/ }).click();
    await expect(page.getByText('Baltimore Open Legislation').first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('english viewer', () => {
  test.use({ locale: 'en-US', viewport: { width: 1280, height: 900 } });

  test('deck defaults to English campaigns', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Baltimore Open Legislation').first()).toBeVisible({ timeout: 20_000 });
    // The Czech-only campaign is hidden by default for an English viewer.
    await expect(page.getByText('Air France')).toHaveCount(0);
  });
});
