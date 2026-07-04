import { test, expect } from './fixtures';

/**
 * The core action: a signed-in user pledges on a campaign ("I'll join if N
 * others do"). Exercises the user-role client + the `participations` insert
 * permission (account_id preset from the session JWT) end-to-end — the path that
 * was silently broken locally until the permission layer was restored.
 */
test('a signed-in user can pledge on a campaign', async ({ page }) => {
  // Unique email => a guaranteed-fresh account with no existing participation.
  const email = `pledge-${Date.now()}@example.com`;
  const res = await page.request.post('/auth/email/request', { data: { email } });
  const { devLink } = await res.json();
  await page.goto(devLink);
  await page.waitForTimeout(1500);

  await page.goto('/campaign/11');
  // Wait for the campaign to hydrate (WS subscription) before probing the form.
  await expect(page.getByRole('heading', { name: /Baltimore Open Legislation/i })).toBeVisible({ timeout: 25_000 });

  const pledge = page.getByRole('button', { name: /Pledge/ });
  await expect(pledge).toBeVisible({ timeout: 15_000 });
  await pledge.click();

  // After pledging, the control switches to the Update/Withdraw form.
  await expect(page.getByRole('button', { name: /Update|Withdraw/ }).first()).toBeVisible({ timeout: 20_000 });
});
