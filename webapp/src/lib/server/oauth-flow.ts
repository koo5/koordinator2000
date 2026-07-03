import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { link_or_create_oauth_account } from '$lib/server/auth';

/**
 * Shared tail of every provider callback: take a verified provider identity,
 * link/create the account (hub-and-spoke, respecting `oauth_link_account` for
 * anonymous-first), hand the signed session to the client via a short-lived
 * cookie, and redirect to /auth/complete. Reused by GitHub, Google, and the
 * email magic-link flow.
 */
export async function completeOAuthAndRedirect(
    cookies: Cookies,
    provider: string,
    providerUserId: string,
    email: string | null,
    explicitAccountId?: number
): Promise<never> {
    const linkAccount = cookies.get('oauth_link_account');
    const currentAccountId = explicitAccountId ?? (linkAccount ? parseInt(linkAccount, 10) : undefined);

    const user = await link_or_create_oauth_account(provider, providerUserId, email, currentAccountId);

    cookies.delete('oauth_link_account', { path: '/' });
    cookies.set('koord_session_handoff', JSON.stringify(user), {
        path: '/', httpOnly: true, secure: !dev, maxAge: 120, sameSite: 'lax',
    });

    throw redirect(302, '/auth/complete');
}
