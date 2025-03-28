// This is a stub for authentication (transitioning from Auth0 to Keycloak)
import { writable } from 'svelte/store';

// Create Auth0Context as a proper constructor class
export class Auth0Context {
  constructor() {
    // Initialize with empty methods
    this.setContext = () => {};
    this.getContext = () => {};
  }
}

// Create writable stores with default values
export const authError = writable(null);
export const authToken = writable(null);
export const idToken = writable(null);
export const isAuthenticated = writable(false);
export const isLoading = writable(false);
export const userInfo = writable(null);

// Stub functions that will eventually connect to Keycloak
export function login() {
  console.log('Login stub called - would redirect to Keycloak login page');
  // In a real implementation, this would redirect to the Keycloak login page
  // window.location.href = '/auth/keycloak/login';
}

export function logout() {
  console.log('Logout stub called - would log out the user from Keycloak');
  isAuthenticated.set(false);
  authToken.set(null);
  idToken.set(null);
  userInfo.set(null);
  // In a real implementation, this would redirect to the Keycloak logout endpoint
  // window.location.href = '/auth/keycloak/logout';
}

// Export additional functions that might be needed
export const auth0 = {
  isAuthenticated: () => false,
  getTokenSilently: async () => null,
  getIdTokenClaims: async () => null,
  loginWithRedirect: () => {
    console.log('Login redirect stub called - would redirect to Keycloak');
    // window.location.href = '/auth/keycloak/login';
  },
  logout: () => {
    console.log('Logout stub called - would redirect to Keycloak logout');
    // window.location.href = '/auth/keycloak/logout';
  },
};

// Stub handler for authentication callbacks
export function handleAuth0Callback() {
  console.log('Auth callback stub called - would process Keycloak tokens');
  return Promise.resolve(false);
}