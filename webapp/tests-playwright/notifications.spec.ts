import { test, expect } from './fixtures';

/**
 * Notifications page: list, unread emphasis, mark-as-read.
 * The rich flow needs a notification row, which only the admin (matcher) can
 * insert — so it runs when HASURA_ADMIN_SECRET is exported to the test run and
 * is skipped otherwise (the empty-state test always runs).
 */

const HASURA = process.env.HASURA_URL || 'http://127.0.0.1:8080/v1/graphql';
const ADMIN = process.env.HASURA_ADMIN_SECRET || '';

async function signIn(page): Promise<number> {
  const email = `notif-${Date.now()}@example.com`;
  const res = await page.request.post('/auth/email/request', { data: { email } });
  const { devLink } = await res.json();
  await page.goto(devLink);
  await page.waitForTimeout(1500);
  return await page.evaluate(() => JSON.parse(localStorage.getItem('my_user') || '{}').id);
}

test('notifications page shows the empty state for a fresh user', async ({ page }) => {
  await signIn(page);
  await page.goto('/notifications');
  await expect(page.getByRole('heading', { name: /Notifications/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/No notifications yet/i)).toBeVisible({ timeout: 15_000 });
});

test('a notification renders and can be marked read', async ({ page }) => {
  test.skip(!ADMIN, 'HASURA_ADMIN_SECRET not exported to the test run');

  const accountId = await signIn(page);

  // Insert a matcher-style notification as admin.
  const gql = (query: string, variables?: any) =>
    page.request.post(HASURA, {
      headers: { 'content-type': 'application/json', 'x-hasura-admin-secret': ADMIN },
      data: { query, variables },
    });
  const camp = await (await gql('{campaigns(limit:1){id}}')).json();
  const campaignId = camp.data.campaigns[0].id;
  await gql(
    'mutation($a:Int!,$c:Int!){insert_campaign_notifications_one(object:{account_id:$a,campaign_id:$c,content:"test: critical mass reached!"}){id}}',
    { a: accountId, c: campaignId }
  );

  await page.goto('/notifications');
  const item = page.locator('.notification-item');
  await expect(item.first()).toBeVisible({ timeout: 15_000 });
  await expect(item.first()).toHaveClass(/unread/);

  // Mark read: unread styling clears (subscription pushes the update back).
  await item.first().getByRole('button').click();
  await expect(item.first()).not.toHaveClass(/unread/, { timeout: 10_000 });

  // Cleanup.
  await gql('mutation($a:Int!){delete_campaign_notifications(where:{account_id:{_eq:$a}}){affected_rows}}', { a: accountId });
});
