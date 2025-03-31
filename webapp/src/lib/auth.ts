import { writable, type Writable } from 'svelte/store';
import { public_env } from './public_env.js';

// Define types for the auth stores
type AuthError = string | null;
type AuthToken = string | null;
type IdToken = string | null;
type UserInfo = Record<string, any> | null;

// Create writable stores with default values
export const authError: Writable<AuthError> = writable(null);
export const authToken: Writable<AuthToken> = writable(null);
export const idToken: Writable<IdToken> = writable(null);
export const isAuthenticated: Writable<boolean> = writable(false);
export const isLoading: Writable<boolean> = writable(false);
export const userInfo: Writable<UserInfo> = writable(null);

// Login function that checks if Keycloak is enabled
export function login(): void {
    if (public_env.ENABLE_KEYCLOAK) {
        console.log('Login: redirecting to Keycloak login page');
        // In a Keycloak implementation, this would redirect to the Keycloak login page
        // window.location.href = '/auth/keycloak/login';
    } else {
        console.log('Login: Keycloak is disabled, no login available');
    }
}

// Logout function
export function logout(): void {
    console.log('Logout: clearing auth state');
    isAuthenticated.set(false);
    authToken.set(null);
    idToken.set(null);
    userInfo.set(null);

    if (public_env.ENABLE_KEYCLOAK) {
        console.log('Logout: would redirect to Keycloak logout endpoint');
        // In a Keycloak implementation, this would redirect to the Keycloak logout endpoint
        // window.location.href = '/auth/keycloak/logout';
    }
}
