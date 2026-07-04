import { test, expect } from './fixtures';

/**
 * Causes (grouping for campaigns): a signed-in user can create a cause and edit
 * its title/description. This replaced the old Firepad/Firebase editor, which
 * never saved and pulled third-party scripts on every page — so this also guards
 * that NO external CDN (firebase/cdnjs/gstatic) is requested.
 */
test('create and edit a cause; no external CDN scripts load', async ({ page }) => {
  const external: string[] = [];
  page.on('request', r => {
    if (/gstatic|cdnjs|firebaseio|firepad|firebasedatabase/.test(r.url())) external.push(r.url());
  });

  // Signed-in user via the magic-link dev flow.
  const email = `cause-${Date.now()}@example.com`;
  const { devLink } = await (await page.request.post('/auth/email/request', { data: { email } })).json();
  await page.goto(devLink);
  await page.waitForTimeout(1500);

  // Create → lands on the edit page for the new cause.
  await page.goto('/add_cause', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Add cause|Přidat kauzu/ }).click();
  await expect(page).toHaveURL(/\/edit_cause\/\d+/, { timeout: 15_000 });

  // Fill + save → redirected to the campaigns deck.
  await page.locator('.cause-wrap input[type=text]').fill('Big Tech accountability (edited)');
  await page.locator('.cause-wrap textarea').fill('Holding large technology companies to account.');
  await page.getByRole('button', { name: /Save cause|Uložit kauzu/ }).click();
  await expect(page).toHaveURL(/\/campaigns/, { timeout: 15_000 });

  // Reopen the edit page: the title persisted.
  await page.goBack();
  await expect(page.locator('.cause-wrap input[type=text]')).toHaveValue('Big Tech accountability (edited)', {
    timeout: 15_000,
  });

  expect(external, `unexpected external CDN requests: ${external.join(', ')}`).toHaveLength(0);
});
