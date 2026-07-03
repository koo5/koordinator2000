import { error } from '@sveltejs/kit';
import { getGoogle } from '$lib/server/oauth';
import { completeOAuthAndRedirect } from '$lib/server/oauth-flow';
import type { RequestHandler } from './$types';

/** Google OAuth callback: validate state + PKCE, exchange, fetch OIDC userinfo, link. */
export const GET: RequestHandler = async ({ url, cookies }) => {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = cookies.get('google_oauth_state');
    const codeVerifier = cookies.get('google_code_verifier');

    if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
        throw error(400, 'Invalid OAuth state');
    }

    let profile: { sub: string; email: string | null; email_verified?: boolean; name?: string };
    try {
        const tokens = await getGoogle().validateAuthorizationCode(code, codeVerifier);
        const accessToken = tokens.accessToken();
        profile = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then(r => r.json());
    } catch (e) {
        console.error('Google OAuth callback error:', e);
        throw error(502, 'Google authentication failed');
    }

    if (!profile?.sub) {
        throw error(502, 'Google returned no subject id');
    }

    cookies.delete('google_oauth_state', { path: '/' });
    cookies.delete('google_code_verifier', { path: '/' });

    return completeOAuthAndRedirect(cookies, 'google', profile.sub, profile.email ?? null);
};
