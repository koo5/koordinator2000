import { test, expect } from './fixtures';

/**
 * OAuth (Arctic) entry points and guards. The full GitHub round-trip needs real
 * credentials; here we verify the wiring: the chooser renders, the flow guards
 * an unconfigured provider, and the callback rejects a bad CSRF state.
 */

test('login page offers the providers', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
});

test('google callback rejects a bad CSRF state (400)', async ({ page }) => {
  const res = await page.goto('/auth/google/callback?code=x&state=bad', { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(400);
});

test('github callback rejects a bad CSRF state (400)', async ({ page }) => {
  const res = await page.goto('/auth/github/callback?code=x&state=bad', { waitUntil: 'domcontentloaded' });
  expect(res?.status()).toBe(400);
});

test('email magic-link signs the user in (dev link)', async ({ page }) => {
  // Dev returns the link in the response, so the whole passwordless flow is
  // exercisable without an email provider.
  const res = await page.request.post('/auth/email/request', {
    data: { email: 'playwright-magic@example.com' },
  });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.devLink).toBeTruthy();

  await page.goto(body.devLink); // -> /auth/complete applies the session (localStorage my_user)
  await page.waitForTimeout(1500);

  const id = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('my_user') || '{}').id;
    } catch {
      return 0;
    }
  });
  expect(Number(id)).toBeGreaterThan(0);
});

test('account page lists linked verified identities', async ({ page }) => {
  const res = await page.request.post('/auth/email/request', {
    data: { email: 'identity-test@example.com' },
  });
  const { devLink } = await res.json();
  await page.goto(devLink);
  await page.waitForTimeout(1500);

  await page.goto('/account');
  await expect(page.getByRole('heading', { name: /Verified identities/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('identity-test@example.com')).toBeVisible();
});
