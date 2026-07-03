import { redirect, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { generateState, generateCodeVerifier } from 'arctic';
import { getGoogle, googleConfigured } from '$lib/server/oauth';
import { verify_user_jwt } from '$lib/server/auth';
import type { RequestHandler } from './$types';

/** Start the Google OAuth flow. Google requires PKCE (a code verifier). */
export const GET: RequestHandler = async ({ cookies }) => {
    if (!googleConfigured()) {
        throw error(503, 'Google sign-in is not configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const opts = { path: '/', httpOnly: true, secure: !dev, maxAge: 600, sameSite: 'lax' as const };
    cookies.set('google_oauth_state', state, opts);
    cookies.set('google_code_verifier', codeVerifier, opts);

    const jwt = cookies.get('Authorization');
    if (jwt) {
        const accountId = await verify_user_jwt(jwt);
        if (accountId) cookies.set('oauth_link_account', String(accountId), opts);
    }

    const url = getGoogle().createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);
    throw redirect(302, url.toString());
};
