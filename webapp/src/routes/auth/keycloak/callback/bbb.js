import { json } from '@sveltejs/kit';
import { exchangeCodeForTokens, storeTokensInCookies, getUserInfo } from '$lib/server/keycloak';
import { public_env } from '$lib/public_env';
import { process_auth_event, user_id_from_auth, free_user_id } from '$lib/server/auth';

/**
 * Simple handler for the Keycloak callback
 * This is a JavaScript implementation (not TypeScript)
 */
export async function GET(event) {
    const { url, cookies } = event;
    
    console.log('Keycloak callback URL:', url.href);
    console.log('Query parameters:', Object.fromEntries(url.searchParams.entries()));

    // If there's an error parameter, handle it
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
        console.error(`Keycloak auth error: ${error}`, errorDescription);
        return new Response(null, {
            status: 302,
            headers: { Location: `/?auth_error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}` }
        });
    }

    // Check if Keycloak is enabled
    if (!public_env.ENABLE_KEYCLOAK) {
        console.log('Keycloak is not enabled, redirecting to home');
        return new Response(null, {
            status: 302,
            headers: { Location: '/' }
        });
    }

    // Get authorization code from query parameters
    const code = url.searchParams.get('code');
    if (!code) {
        console.log('No authorization code provided, redirecting to home');
        return new Response(null, {
            status: 302,
            headers: { Location: '/?auth_error=no_code' }
        });
    }

    // Get redirect URI for token exchange (must match what was used in login request)
    const redirectUri = `${public_env.PUBLIC_URL}/auth/keycloak/callback`;
    
    // Debug - log configuration
    console.log('Keycloak callback configuration:', {
        redirectUri,
        publicUrl: public_env.PUBLIC_URL,
        keycloakUrl: public_env.KEYCLOAK_URL,
        keycloakRealm: public_env.KEYCLOAK_REALM,
        keycloakClientId: public_env.KEYCLOAK_CLIENT_ID
    });

    try {
        // For now, just redirect to home page with success message
        return new Response(null, {
            status: 302,
            headers: { Location: '/?callback_received=true' }
        });
    } catch (error) {
        console.error('Keycloak callback error:', error instanceof Error ? error.message : String(error));
        return new Response(null, {
            status: 302,
            headers: { Location: '/?auth_error=true' }
        });
    }
}