import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { exchangeCodeForTokens, storeTokensInCookies, getUserInfo } from '$lib/server/keycloak';
import { public_env } from '$lib/public_env';
import { process_auth_event, user_id_from_auth, free_user_id } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, cookies }) => {
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

        // Look up user in verified_user_authentications
        const existingUserId = await user_id_from_auth('keycloak', userInfo.sub);

        // Store Keycloak info in the session for new user flow
        const keycloakInfo = {
            sub: userInfo.sub,
            email: userInfo.email,
            preferred_username: userInfo.preferred_username,
            name: userInfo.name
        };

        // Store auth token and user info in cookies temporarily for the new user flow
        cookies.set('keycloak_temp_token', tokens.access_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 600, // 10 minutes
            sameSite: 'lax',
        });

        cookies.set('keycloak_temp_info', JSON.stringify(keycloakInfo), {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 600, // 10 minutes
            sameSite: 'lax',
        });

        if (existingUserId) {
            // Existing user - process auth event and set my_user
            console.log(`Using existing Keycloak user with ID: ${existingUserId}`);
            const authResult = await process_auth_event({
                id: existingUserId, // Include the existing user ID in the event
                auth: {
                    keycloak: {
                        token: tokens.access_token,
                        info: keycloakInfo
                    }
                }
            });

            if (authResult && authResult.user) {
                // Redirect to a page that will set localStorage and then redirect
                // We'll use a special route that sets the user in localStorage
                const returnTo = cookies.get('keycloak_return_to') || '/';
                cookies.delete('keycloak_return_to', { path: '/' });

                // Pass the user data as a query parameter
                const userDataParam = encodeURIComponent(JSON.stringify(authResult.user));
                return new Response(null, {
                    status: 302,
                    headers: { Location: `/auth/set-user?userData=${userDataParam}&returnTo=${encodeURIComponent(returnTo)}` }
                });
            } else {
                throw new Error('Failed to process auth event');
            }
        } else {
            // New user - redirect to new user setup page
            // Generate a temporary user ID
            const newUser = await free_user_id(userInfo.email || null);

            // For new users, create a unique URL with all the necessary data
            // Always use the randomly generated username from free_user_id
            // The user can change it on the signup page if desired
            const newUserData = {
                userId: newUser.id,
                suggestedName: newUser.name, // Use the randomly generated name
                keycloakRealName: keycloakInfo.name || '', // Store real name separately for reference
                keycloakUsername: keycloakInfo.preferred_username || '', // Store Keycloak username separately
                keycloakInfo: keycloakInfo,
                keycloakToken: tokens.access_token
            };

            // We'll pass this data to a special page that handles new user creation
            const newUserDataParam = encodeURIComponent(JSON.stringify(newUserData));
            return new Response(null, {
                status: 302,
                headers: { Location: `/new_user?data=${newUserDataParam}` }
            });
        }
    } catch (error) {
        console.error('Keycloak callback error:', error instanceof Error ? error.message : String(error));
        return new Response(null, {
            status: 302,
            headers: { Location: '/?auth_error=true' }
        });
    }
};
