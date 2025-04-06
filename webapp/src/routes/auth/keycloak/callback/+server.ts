import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { exchangeCodeForTokens, storeTokensInCookies, getUserInfo } from '$lib/server/keycloak';
import { public_env } from '$lib/public_env';
import { process_auth_event } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {

    console.log('Keycloak callback URL:', url.href, 'Code:', url.searchParams.get('code'));

    // Check if Keycloak is enabled
    if (!public_env.ENABLE_KEYCLOAK) {
        throw redirect(302, '/');
    }

    // Get authorization code from query parameters
    const code = url.searchParams.get('code');
    if (!code) {
        throw redirect(302, '/');
    }

    // Get redirect URI for token exchange (must match what was used in login request)
    const redirectUri = `${public_env.PUBLIC_URL}/auth/keycloak/callback`;

    try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code, redirectUri);
        if (!tokens) {
            throw new Error('Failed to exchange code for tokens');
        }

        // Store tokens in cookies
        storeTokensInCookies(cookies, tokens);

        // Get user info
        const userInfo = await getUserInfo(tokens.access_token);
        if (!userInfo) {
            throw new Error('Failed to get user info');
        }

        console.log('keycloak callback User info:', userInfo);

        // Process auth event to link Keycloak identity with internal user
        await process_auth_event({
            auth: {
                keycloak: {
                    token: tokens.access_token,
                    info: {
                        sub: userInfo.sub,
                        email: userInfo.email,
                        preferred_username: userInfo.preferred_username,
                        name: userInfo.name
                    }
                }
            }
        });

        // Redirect to original destination or homepage
        const returnTo = cookies.get('keycloak_return_to') || '/';
        cookies.delete('keycloak_return_to', { path: '/' });

        throw redirect(302, returnTo);
    } catch (error) {
        console.error('Keycloak callback error:', error);
        throw redirect(302, '/?auth_error=true');
    }
};
