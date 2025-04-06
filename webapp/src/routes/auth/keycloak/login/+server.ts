import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { createLoginUrl } from '$lib/server/keycloak';
import { public_env } from '$lib/public_env';

export const GET: RequestHandler = async ({ url, cookies }) => {
    console.log('Keycloak login route hit');
    console.log('Environment variables:', {
        ENABLE_KEYCLOAK: public_env.ENABLE_KEYCLOAK,
        KEYCLOAK_URL: public_env.KEYCLOAK_URL,
        KEYCLOAK_REALM: public_env.KEYCLOAK_REALM,
        KEYCLOAK_CLIENT_ID: public_env.KEYCLOAK_CLIENT_ID,
        PUBLIC_URL: public_env.PUBLIC_URL
    });
    
    // Check if Keycloak is enabled
    if (!public_env.ENABLE_KEYCLOAK) {
        console.log('Keycloak is not enabled, returning error');
        return json({ error: 'Keycloak is not enabled' }, { status: 400 });
    }

    // Get redirect_uri from query parameters or use default
    const redirectUri = url.searchParams.get('redirect_uri') || `${public_env.PUBLIC_URL}/auth/keycloak/callback`;

    // Create Keycloak login URL
    const loginUrl = createLoginUrl(redirectUri);

    // Store the original redirect destination to use after authentication
    const returnTo = url.searchParams.get('return_to') || '/';
    cookies.set('keycloak_return_to', returnTo, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 minutes
        sameSite: 'lax',
    });

    // Redirect to Keycloak login
    console.log('Redirecting to Keycloak login:', loginUrl);
    console.log('Return to:', returnTo);
    console.log('Cookies:', cookies.get('keycloak_return_to'));
    console.log('Redirect URI:', redirectUri);
    throw redirect(302, loginUrl);
};
