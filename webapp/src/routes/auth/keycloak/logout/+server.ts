import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clearAuthCookies, createLogoutUrl } from '$lib/server/keycloak';
import { public_env } from '$lib/public_env';

export const GET: RequestHandler = async ({ url, cookies }) => {
    // Check if Keycloak is enabled
    if (!public_env.ENABLE_KEYCLOAK) {
        throw redirect(302, '/');
    }

    // Clear auth cookies
    clearAuthCookies(cookies);

    // Get redirect_uri from query parameters or use default
    const redirectUri = url.searchParams.get('redirect_uri') || public_env.PUBLIC_URL;
    
    // Create Keycloak logout URL
    const logoutUrl = createLogoutUrl(redirectUri);
    
    // Redirect to Keycloak logout
    throw redirect(302, logoutUrl);
};