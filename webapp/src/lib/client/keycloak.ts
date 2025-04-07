/**
 * Client-side Keycloak integration
 */
import Keycloak from 'keycloak-js';
import { browser } from '$app/environment';
import { writable, get, type Writable } from 'svelte/store';
import { public_env } from '$lib/public_env';
import { auth_event, my_user, type MyUser } from './my_user';
import type { SharedStore } from './svelte-shared-store';

// Keycloak instance stores
export const keycloakInstance: Writable<Keycloak | null> = writable(null);
export const isKeycloakInitialized: Writable<boolean> = writable(false);
export const isAuthenticated: Writable<boolean> = writable(false);
export const keycloakError: Writable<Error | null> = writable(null);
export const keycloakToken: Writable<string | null> = writable(null);
export const keycloakProfile: Writable<any | null> = writable(null);

/**
 * Initialize Keycloak
 * @returns Promise that resolves when Keycloak is initialized
 */
export async function initKeycloak(): Promise<boolean> {
    if (!browser || !public_env.ENABLE_KEYCLOAK) {
        return false;
    }

    try {
        // Reset errors
        keycloakError.set(null);

        // Create Keycloak instance
        const keycloak = new Keycloak({
            url: public_env.KEYCLOAK_URL,
            realm: public_env.KEYCLOAK_REALM,
            clientId: public_env.KEYCLOAK_CLIENT_ID
        });

        // Store instance in Svelte store
        keycloakInstance.set(keycloak);

        // Initialize Keycloak with silent check-sso (try to authenticate without redirecting)
        const authenticated = await keycloak.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            checkLoginIframe: false,
            pkceMethod: 'S256'
        });

        // Update authenticated state
        isAuthenticated.set(authenticated);
        isKeycloakInitialized.set(true);

        if (authenticated) {
            // Store token
            keycloakToken.set(keycloak.token || null);

            // Load and store user profile
            try {
                const profile = await keycloak.loadUserProfile();
                keycloakProfile.set(profile);

                // Get the current user ID from the store
                const currentUser = get(my_user);
                const userId = currentUser.id > 0 ? currentUser.id : null;

                // Send auth event to server for identity linking
                const authResponse = await auth_event({
                    type: 'keycloak_auth',
                    id: userId, // Include current user ID if we have one
                    auth: {
                        keycloak: {
                            token: keycloak.token,
                            info: {
                                sub: keycloak.subject || '',
                                email: profile.email,
                                preferred_username: profile.username,
                                name: profile.firstName && profile.lastName
                                    ? `${profile.firstName} ${profile.lastName}`
                                    : profile.username
                            }
                        }
                    }
                });

                // Update user if needed from auth response
                if (authResponse && authResponse.user) {
                    // This means the server wants us to use a different user ID
                    // (the one associated with this Keycloak identity)
                    if (authResponse.user.id !== currentUser.id) {
                        (my_user as SharedStore<MyUser>).set(authResponse.user);
                    }
                }
            } catch (error) {
                console.error('Failed to load Keycloak user profile:', error);
            }

            // Set up token refresh
            setupTokenRefresh(keycloak);
        }

        // Set up event listeners
        setupKeycloakEvents(keycloak);

        return authenticated;
    } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        keycloakError.set(error instanceof Error ? error : new Error(String(error)));
        return false;
    }
}

/**
 * Set up Keycloak event listeners
 * @param keycloak - Keycloak instance
 */
function setupKeycloakEvents(keycloak: Keycloak): void {
    keycloak.onAuthSuccess = () => {
        console.log('Keycloak: Authentication success');
        isAuthenticated.set(true);
        keycloakToken.set(keycloak.token || null);

        // Reload user profile
        keycloak.loadUserProfile()
            .then(profile => {
                keycloakProfile.set(profile);

                // Get the current user ID from the store
                const currentUser = get(my_user);
                const userId = currentUser.id > 0 ? currentUser.id : null;

                // Send auth event to server for identity linking
                return auth_event({
                    type: 'keycloak_auth',
                    id: userId,
                    auth: {
                        keycloak: {
                            token: keycloak.token,
                            info: {
                                sub: keycloak.subject || '',
                                email: profile.email,
                                preferred_username: profile.username,
                                name: profile.firstName && profile.lastName
                                    ? `${profile.firstName} ${profile.lastName}`
                                    : profile.username
                            }
                        }
                    }
                }).then(authResponse => {
                    // Update user if needed from auth response
                    if (authResponse && authResponse.user) {
                        // This means the server wants us to use a different user ID
                        // (the one associated with this Keycloak identity)
                        if (authResponse.user.id !== currentUser.id) {
                            (my_user as SharedStore<MyUser>).set(authResponse.user);
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Failed to load user profile after auth success:', error);
            });
    };

    keycloak.onAuthError = () => {
        console.error('Keycloak: Authentication error');
        isAuthenticated.set(false);
        keycloakProfile.set(null);
        keycloakToken.set(null);
        keycloakError.set(new Error('Authentication failed'));
    };

    keycloak.onAuthRefreshSuccess = () => {
        console.log('Keycloak: Token refresh success');
        keycloakToken.set(keycloak.token || null);
    };

    keycloak.onAuthRefreshError = () => {
        console.error('Keycloak: Token refresh error');
        // Force re-authentication on refresh error
        logout();
    };

    keycloak.onAuthLogout = () => {
        console.log('Keycloak: Logged out');
        isAuthenticated.set(false);
        keycloakProfile.set(null);
        keycloakToken.set(null);
    };

    keycloak.onTokenExpired = () => {
        console.log('Keycloak: Token expired');
        updateToken();
    };
}

/**
 * Set up automatic token refresh
 * @param keycloak - Keycloak instance
 */
function setupTokenRefresh(keycloak: Keycloak): void {
    // Check token every minute
    setInterval(() => {
        updateToken();
    }, 60 * 1000);
}

/**
 * Update Keycloak token
 * @param minValidity - Minimum validity time in seconds (default: 30)
 * @returns Promise that resolves when token is updated
 */
export async function updateToken(minValidity: number = 30): Promise<boolean> {
    const keycloak = get(keycloakInstance);

    if (!keycloak) {
        return false;
    }

    try {
        const updated = await keycloak.updateToken(minValidity);

        if (updated) {
            keycloakToken.set(keycloak.token || null);
        }

        return updated;
    } catch (error) {
        console.error('Failed to update token:', error);
        return false;
    }
}

/**
 * Login with Keycloak
 * @param redirectUri - Optional redirect URI after login
 * @param register - Whether to redirect to registration page (default: false)
 */
export function login(redirectUri?: string, register: boolean = false): void {
    const keycloak = get(keycloakInstance);

    if (!keycloak) {
        console.error('Keycloak is not initialized');
        return;
    }

    const options: Keycloak.KeycloakLoginOptions = {
        redirectUri: redirectUri || window.location.href,
        action: register ? 'register' : undefined
    };

    keycloak.login(options);
}

/**
 * Logout from Keycloak
 * @param redirectUri - Optional redirect URI after logout
 */
export function logout(redirectUri?: string): void {
    const keycloak = get(keycloakInstance);

    if (!keycloak) {
        console.error('Keycloak is not initialized');
        return;
    }

    const options: Keycloak.KeycloakLogoutOptions = {
        redirectUri: redirectUri || window.location.origin
    };

    keycloak.logout(options);
}

/**
 * Register with Keycloak (redirects to registration page)
 * @param redirectUri - Optional redirect URI after registration
 */
export function register(redirectUri?: string): void {
    login(redirectUri, true);
}

/**
 * Get current authentication status
 * @returns Whether user is authenticated with Keycloak
 */
export function isUserAuthenticated(): boolean {
    const keycloak = get(keycloakInstance);
    return !!keycloak?.authenticated;
}

/**
 * Account management (redirects to Keycloak account page)
 */
export function accountManagement(): void {
    const keycloak = get(keycloakInstance);

    if (!keycloak) {
        console.error('Keycloak is not initialized');
        return;
    }

    keycloak.accountManagement();
}

// Initialize when the module is loaded, if browser environment
if (browser && public_env.ENABLE_KEYCLOAK) {
    initKeycloak().catch(error => {
        console.error('Failed to initialize Keycloak:', error);
    });
}

// Add type definitions for global environment variables
declare global {
    interface Window {
        _env_?: {
            KEYCLOAK_URL?: string;
            KEYCLOAK_REALM?: string;
            KEYCLOAK_CLIENT_ID?: string;
        };
    }
}
