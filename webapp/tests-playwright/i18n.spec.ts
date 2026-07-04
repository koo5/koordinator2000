import { test, expect } from './fixtures';

/**
 * i18n: cs + en with automatic selection (Accept-Language), a manual switcher,
 * and cookie persistence (SSR renders the chosen language directly).
 */

test.describe('czech browser', () => {
  test.use({ locale: 'cs-CZ', viewport: { width: 1280, height: 900 } });

  test('gets Czech automatically (nav + <html lang> + pledge control)', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Kampaně' })).toBeVisible({ timeout: 15_000 });
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('cs');
    // A translated component string (not just nav): the pledge button.
    await expect(page.getByRole('button', { name: /Přislíbit/ }).first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('english browser', () => {
  test.use({ locale: 'en-US', viewport: { width: 1280, height: 900 } });

  test('gets English, can switch to Czech, and the choice persists (cookie + SSR)', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Campaigns' })).toBeVisible({ timeout: 15_000 });

    await page.locator('.user-dropdown label').click();
    await page.waitForTimeout(400); // let the DaisyUI dropdown settle (focus-based)
    await page.getByRole('button', { name: 'CS', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Kampaně' })).toBeVisible({ timeout: 5_000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Kampaně' })).toBeVisible({ timeout: 15_000 });
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('cs');
  });
});
