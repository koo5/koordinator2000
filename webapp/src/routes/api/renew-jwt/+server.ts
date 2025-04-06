import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { sign_user_object } from '$lib/server/auth.ts';

// Token refresh threshold in seconds (default: 10 minutes)
const TOKEN_REFRESH_THRESHOLD = 10 * 60;

/**
 * Handle POST requests to renew JWT
 * This endpoint generates a new JWT for the current user
 */
export async function POST(event: RequestEvent) {
    try {
        // The user authentication is already handled by hooks.server.ts
        // and made available through event.locals.user
        if (!event.locals.user || !event.locals.user.id) {
            return json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        // Extract current user from locals
        const currentUser = event.locals.user;
        
        // Check token expiration
        // Get the token from the current user
        const token = currentUser.jwt;
        if (!token) {
            return json({ error: 'No JWT token found' }, { status: 400 });
        }
        
        // Parse the JWT to get expiration
        const parts = token.split('.');
        if (parts.length !== 3) {
            return json({ error: 'Invalid token format' }, { status: 400 });
        }
        
        try {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            const now = Math.floor(Date.now() / 1000);
            
            // Only renew if the token is about to expire
            if (payload.exp && payload.exp > now + TOKEN_REFRESH_THRESHOLD) {
                return json({ 
                    error: 'Token is not expiring soon',
                    message: 'Token does not need to be refreshed yet',
                    expiresIn: payload.exp - now
                }, { status: 429 });
            }
        } catch (error) {
            console.error('Error parsing token payload:', error);
            return json({ error: 'Invalid token format' }, { status: 400 });
        }
        
        // Generate a new JWT for the user, preserving all user properties
        // Make sure name is a string as required by UserObject
        const userToSign = {
            ...currentUser,
            name: currentUser.name || ''
        };
        const user = await sign_user_object(userToSign);
        
        // Return the user with new JWT
        return json({ user });
    } catch (error) {
        console.error('Error in JWT renewal:', error);
        return json({ error: 'Internal server error during JWT renewal' }, { status: 500 });
    }
}