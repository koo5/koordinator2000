import { test, expect } from './fixtures';

/**
 * Location: OSM/Leaflet map on the campaign detail page, and the "Near me"
 * discovery filter (bounding-box, composes with the rest of the toolbar).
 * Seed data: campaign 11 = Baltimore, 84 = Praha, 45 = Brno (~184 km from Praha).
 */

test('campaign detail shows its location and renders the map', async ({ page }) => {
  await page.goto('/campaign/11', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/📍 Baltimore/)).toBeVisible({ timeout: 20_000 });
  // Leaflet initialized and actually fetched at least one OSM tile.
  await expect(page.locator('.loc-map.leaflet-container')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.loc-map img.leaflet-tile').first()).toBeVisible({ timeout: 10_000 });
});

test.describe('near-me filter', () => {
  // Geolocate the browser to Prague; grant permission.
  test.use({
    geolocation: { latitude: 50.08, longitude: 14.43 },
    permissions: ['geolocation'],
    viewport: { width: 1280, height: 900 },
  });

  test('narrows the deck to nearby campaigns, radius widens it', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 20_000 });

    // The seeded near-Prague campaigns are Czech; this en viewer must open the
    // deck to all languages first (location and language are independent axes).
    await page.getByRole('button', { name: /All languages|only/ }).click();
    await page.getByRole('button', { name: /Near me/ }).click();
    // Prague campaign stays; Baltimore (an ocean away) is filtered out.
    await expect(page.getByText(/extremist Polish/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Baltimore Open Legislation')).toHaveCount(0);

    // Brno is ~184 km away: absent at 100 km, present at 500 km.
    await expect(page.getByText('Air France')).toHaveCount(0);
    await page.locator('select[aria-label="Distance"]').selectOption('500');
    await expect(page.getByText('Air France').first()).toBeVisible({ timeout: 15_000 });
  });

  test('sort by distance orders nearest first', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.listing-item').first()).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: /All languages|only/ }).click();
    await page.getByRole('button', { name: /Near me/ }).click();
    await page.locator('select[aria-label="Distance"]').selectOption('500');
    await page.locator('#sort-by').selectOption('distance');

    // Praha (~0 km from the viewer) must come before Brno (~184 km).
    await expect(page.locator('.listing-item h2').first()).toContainText(/extremist Polish/i, { timeout: 15_000 });
  });
});
