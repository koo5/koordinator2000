import { test, expect } from './fixtures';

/**
 * Core pages load and render against the local Hasura data plane.
 * These are the routes that survived the Keycloak teardown.
 */
const pages = ['/', '/campaigns', '/account', '/add_campaign', '/notifications'];

for (const path of pages) {
  test(`loads ${path}`, async ({ page }) => {
    const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(res?.status(), `HTTP status for ${path}`).toBeLessThan(400);
    // The app shell (header nav) should be present on every page.
    await expect(page.locator('.navbar')).toBeVisible();
  });
}

test('campaigns list renders restored data', async ({ page }) => {
  await page.goto('/campaigns', { waitUntil: 'domcontentloaded' });
  // At least one campaign title from the restored April dump should appear.
  await expect(
    page.getByText(/Baltimore Open Legislation|boycott|Ahava|Font Awesome/i).first()
  ).toBeVisible({ timeout: 20_000 });
});
