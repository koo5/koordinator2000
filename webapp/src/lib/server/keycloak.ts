/**
 * Server-side Keycloak integration
 * This file handles server-side Keycloak operations for the SvelteKit application
 */
import { server_env } from '$lib/server/env';
import type { RequestEvent } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';

/**
 * Interface for Keycloak token introspection response
 */
interface TokenIntrospectionResponse {
    active: boolean;
    sub?: string;
    email?: string;
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    name?: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
}

/**
 * Interface for Keycloak token verification result
 */
interface TokenVerificationResult {
    valid: boolean;
    decodedToken?: TokenIntrospectionResponse;
}

/**
 * Verify a Keycloak token with the Keycloak server
 * @param token - The token to verify
 * @returns Promise with token verification result
 */
export async function verifyToken(token: string): Promise<TokenVerificationResult> {
    try {
        if (!token) {
            return { valid: false };
        }

        // Build the token introspection endpoint URL
        const introspectionUrl = `${server_env.KEYCLOAK_URL}/realms/${server_env.KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`;
        
        // Create form data for the request
        const formData = new URLSearchParams();
        formData.append('token', token);
        formData.append('client_id', server_env.KEYCLOAK_CLIENT_ID);
        formData.append('client_secret', server_env.KEYCLOAK_CLIENT_SECRET);
        
        // Make the request to Keycloak
        const response = await fetch(introspectionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
        
        if (!response.ok) {
            console.error('Token introspection failed:', await response.text());
            return { valid: false };
        }
        
        // Parse the response
        const tokenInfo = await response.json() as TokenIntrospectionResponse;
        
        // Check if the token is active
        if (!tokenInfo.active) {
            return { valid: false };
        }
        
        return {
            valid: true,
            decodedToken: tokenInfo,
        };
    } catch (error) {
        console.error('Error verifying token:', error);
        return { valid: false };
    }
}

/**
 * Extract Keycloak token from a request event
 * @param event - SvelteKit request event
 * @returns The token or null if not found
 */
export function getTokenFromRequest(event: RequestEvent): string | null {
    try {
        // Check authorization header first
        const authHeader = event.request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        // Check cookies
        const cookie = event.cookies.get('keycloak_token');
        if (cookie) {
            return cookie;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting token from request:', error);
        return null;
    }
}

/**
 * Get user info from a Keycloak token
 * @param token - Keycloak token
 * @returns Promise with user info
 */
export async function getUserInfo(token: string): Promise<any> {
    try {
        if (!token) {
            return null;
        }
        
        // Build the userinfo endpoint URL
        const userInfoUrl = `${server_env.KEYCLOAK_URL}/realms/${server_env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
        
        // Make the request to Keycloak
        const response = await fetch(userInfoUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        if (!response.ok) {
            console.error('Failed to get user info:', await response.text());
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting user info:', error);
        return null;
    }
}

/**
 * Exchange an authorization code for tokens
 * @param code - Authorization code
 * @param redirectUri - Redirect URI used in the initial request
 * @returns Promise with tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
    try {
        // Build the token endpoint URL
        const tokenUrl = `${server_env.KEYCLOAK_URL}/realms/${server_env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
        
        // Create form data for the request
        const formData = new URLSearchParams();
        formData.append('grant_type', 'authorization_code');
        formData.append('code', code);
        formData.append('client_id', server_env.KEYCLOAK_CLIENT_ID);
        formData.append('client_secret', server_env.KEYCLOAK_CLIENT_SECRET);
        formData.append('redirect_uri', redirectUri);
        
        // Make the request to Keycloak
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
        
        if (!response.ok) {
            console.error('Failed to exchange code for tokens:', await response.text());
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error exchanging code for tokens:', error);
        return null;
    }
}

/**
 * Store tokens in cookies
 * @param cookies - SvelteKit cookies object
 * @param tokens - Token response from Keycloak
 */
export function storeTokensInCookies(cookies: Cookies, tokens: any): void {
    if (!tokens) return;
    
    const secure = process.env.NODE_ENV === 'production';
    const maxAge = tokens.expires_in || 300; // Default to 5 minutes
    
    cookies.set('keycloak_token', tokens.access_token, {
        path: '/',
        httpOnly: true,
        secure,
        maxAge,
        sameSite: 'lax',
    });
    
    cookies.set('keycloak_refresh_token', tokens.refresh_token, {
        path: '/',
        httpOnly: true,
        secure,
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'lax',
    });
    
    if (tokens.id_token) {
        cookies.set('keycloak_id_token', tokens.id_token, {
            path: '/',
            httpOnly: true,
            secure,
            maxAge,
            sameSite: 'lax',
        });
    }
}

/**
 * Clear authentication cookies
 * @param cookies - SvelteKit cookies object
 */
export function clearAuthCookies(cookies: Cookies): void {
    cookies.delete('keycloak_token', { path: '/' });
    cookies.delete('keycloak_refresh_token', { path: '/' });
    cookies.delete('keycloak_id_token', { path: '/' });
}

/**
 * Refresh tokens using a refresh token
 * @param refreshToken - Refresh token
 * @returns Promise with new tokens
 */
export async function refreshTokens(refreshToken: string): Promise<any> {
    if (!refreshToken) {
        return null;
    }
    
    try {
        // Build the token endpoint URL
        const tokenUrl = `${server_env.KEYCLOAK_URL}/realms/${server_env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
        
        // Create form data for the request
        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', refreshToken);
        formData.append('client_id', server_env.KEYCLOAK_CLIENT_ID);
        formData.append('client_secret', server_env.KEYCLOAK_CLIENT_SECRET);
        
        // Make the request to Keycloak
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });
        
        if (!response.ok) {
            console.error('Failed to refresh tokens:', await response.text());
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error refreshing tokens:', error);
        return null;
    }
}

/**
 * Create a Keycloak login URL
 * @param redirectUri - Redirect URI after login
 * @returns Login URL
 */
export function createLoginUrl(redirectUri: string): string {
    const params = new URLSearchParams({
        client_id: server_env.KEYCLOAK_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
    });
    
    return `${server_env.KEYCLOAK_URL}/realms/${server_env.KEYCLOAK_REALM}/protocol/openid-connect/auth?${params.toString()}`;
}

/**
 * Create a Keycloak logout URL
 * @param redirectUri - Redirect URI after logout
 * @returns Logout URL
 */
export function createLogoutUrl(redirectUri: string): string {
    const params = new URLSearchParams({
        client_id: server_env.KEYCLOAK_CLIENT_ID,
        post_logout_redirect_uri: redirectUri,
    });
    
    return `${server_env.KEYCLOAK_URL}/realms/${server_env.KEYCLOAK_REALM}/protocol/openid-connect/logout?${params.toString()}`;
}