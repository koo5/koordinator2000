import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clearAuthCookies } from '$lib/server/keycloak';

// Handle POST request to forget Keycloak authentication
export const POST: RequestHandler = async ({ cookies }) => {
    try {
        // Clear all Keycloak-related cookies
        clearAuthCookies(cookies);
        
        // Clear temporary cookies
        cookies.delete('new_user_id', { path: '/' });
        cookies.delete('keycloak_temp_token', { path: '/' });
        cookies.delete('keycloak_temp_info', { path: '/' });
        cookies.delete('suggested_username', { path: '/' });
        cookies.delete('my_user_info', { path: '/' });
        
        return json({ success: true });
    } catch (error) {
        console.error('Error forgetting Keycloak auth:', error);
        return json({ error: 'Failed to forget authentication' }, { status: 500 });
    }
};