import { json } from '@sveltejs/kit';
import { process_auth_event } from '$lib/server/auth.ts';
import type { RequestHandler } from './$types';

/**
 * Handle authentication events from the client
 * This endpoint processes Keycloak authentication events and associates
 * Keycloak identities with internal user IDs
 */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
    try {
        // Parse the request body to get the event data
        const data = await request.json();
        if (!data || !data.event) {
            console.error('Invalid auth event payload:', data);
            return json({ error: 'Invalid payload' }, { status: 400 });
        }
        
        console.log('Processing auth event:', JSON.stringify(data.event, null, 2));
        
        // If the event includes the current user's ID from the client, use it
        // Otherwise, try to get it from the JWT in cookies if available
        const event = data.event;
        
        // Process the auth event (linking identities or finding associated user)
        const result = await process_auth_event(event);
        console.log('Auth event processing result:', result);
        
        // If we got a user back with a JWT, set it in a cookie for server-side auth
        if (result && result.user && result.user.jwt) {
            cookies.set('jwt', result.user.jwt, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 2, // 2 hours (matching the JWT expiration)
                sameSite: 'lax'
            });
        }
        
        return json(result || {});
    } catch (error) {
        console.error('Error processing auth event:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};
