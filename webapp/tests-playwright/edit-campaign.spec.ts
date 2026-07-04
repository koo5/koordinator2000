import { test, expect } from './fixtures';

/**
 * Campaign editing: the maintainer of a campaign can edit its fields; a
 * non-maintainer sees no edit affordance and (by Hasura permission) can't write.
 * Exercises the update_campaigns_by_pk path end-to-end, and the MutationForm
 * on:done dispatch that the create-success flow relies on.
 */
test('a maintainer creates then edits their campaign; others cannot', async ({ page, browser }) => {
  // Fresh signed-in user via the magic-link dev flow → they become maintainer.
  const email = `edit-${Date.now()}@example.com`;
  const res = await page.request.post('/auth/email/request', { data: { email } });
  const { devLink } = await res.json();
  await page.goto(devLink);
  await page.waitForTimeout(1500);

  // Create a campaign.
  await page.goto('/add_campaign', { waitUntil: 'domcontentloaded' });
  await page.locator('.add-wrap input[type=text]').first().fill('My Editable Campaign');
  await page.locator('.add-wrap textarea').first().fill('Original description.');
  await page.getByRole('button', { name: /Create campaign/ }).click();

  // The success flow (driven by MutationForm on:done) reveals the View link.
  const view = page.getByRole('link', { name: /View your campaign/ });
  await expect(view).toBeVisible({ timeout: 15_000 });
  await view.click();

  // The maintainer sees the edit button; a fresh title saves and shows.
  const editBtn = page.getByRole('button', { name: /Edit campaign/ });
  await expect(editBtn).toBeVisible({ timeout: 20_000 });
  await editBtn.click();
  await page.locator('.edit-wrap input[type=text]').first().fill('Edited Campaign Title');
  await page.getByRole('button', { name: /Save changes/ }).click();

  await expect(page.getByRole('heading', { name: 'Edited Campaign Title' })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.edit-wrap')).toHaveCount(0); // back in view mode

  // A different (anonymous) visitor gets no edit affordance.
  const url = page.url();
  const otherCtx = await browser.newContext();
  const other = await otherCtx.newPage();
  await other.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(other.getByRole('heading', { name: 'Edited Campaign Title' })).toBeVisible({ timeout: 20_000 });
  await expect(other.getByRole('button', { name: /Edit campaign/ })).toHaveCount(0);
  await otherCtx.close();
});
