import { redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { generateState } from 'arctic';
import { getGitHub, githubConfigured } from '$lib/server/oauth';
import { verify_user_jwt } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/**
 * Start the GitHub OAuth flow. Stores a CSRF `state`, and — if a valid current
 * session JWT is present (anonymous-first) — remembers which account to attach
 * the new verification to.
 */
export const GET: RequestHandler = async ({ cookies }) => {
    if (!githubConfigured()) {
        throw error(503, 'GitHub sign-in is not configured (set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET)');
    }

    const state = generateState();
    cookies.set('github_oauth_state', state, {
        path: '/', httpOnly: true, secure: !dev, maxAge: 600, sameSite: 'lax',
    });

    const jwt = cookies.get('Authorization');
    if (jwt) {
        const accountId = await verify_user_jwt(jwt);
        if (accountId) {
            cookies.set('oauth_link_account', String(accountId), {
                path: '/', httpOnly: true, secure: !dev, maxAge: 600, sameSite: 'lax',
            });
        }
    }

    const url = getGitHub().createAuthorizationURL(state, ['read:user', 'user:email']);
    throw redirect(302, url.toString());
};
