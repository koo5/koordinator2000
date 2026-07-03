import { error } from '@sveltejs/kit';
import { getGitHub } from '$lib/server/oauth';
import { completeOAuthAndRedirect } from '$lib/server/oauth-flow';
import type { RequestHandler } from './$types';

const GH_HEADERS = (token: string) => ({
    Authorization: `Bearer ${token}`,
    'User-Agent': 'koordinator',
    Accept: 'application/vnd.github+json',
});

/**
 * GitHub OAuth callback: validate state, exchange the code, fetch the identity,
 * turn it into a verified spoke on an account, then hand the signed session off
 * to the client (which stores it in localStorage as my_user).
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies.get('github_oauth_state');

    if (!code || !state || !storedState || state !== storedState) {
        throw error(400, 'Invalid OAuth state');
    }

    let ghUser: { id: number; login: string; email: string | null };
    try {
        const tokens = await getGitHub().validateAuthorizationCode(code);
        const accessToken = tokens.accessToken();

        ghUser = await fetch('https://api.github.com/user', { headers: GH_HEADERS(accessToken) }).then(r => r.json());

        // GitHub hides the email on /user when it's private — fetch the primary verified one.
        if (!ghUser.email) {
            const emails = await fetch('https://api.github.com/user/emails', { headers: GH_HEADERS(accessToken) }).then(r => r.json());
            if (Array.isArray(emails)) {
                const primary = emails.find((e: any) => e.primary && e.verified) || emails.find((e: any) => e.verified);
                ghUser.email = primary?.email ?? null;
            }
        }
    } catch (e) {
        console.error('GitHub OAuth callback error:', e);
        throw error(502, 'GitHub authentication failed');
    }

    if (!ghUser?.id) {
        throw error(502, 'GitHub returned no user id');
    }

    cookies.delete('github_oauth_state', { path: '/' });
    return completeOAuthAndRedirect(cookies, 'github', String(ghUser.id), ghUser.email);
};
