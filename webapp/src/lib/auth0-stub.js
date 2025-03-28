// This is a stub for @dopry/svelte-auth0
import { writable } from 'svelte/store';

// Create writable stores with default values
export const Auth0Context = { setContext: () => {}, getContext: () => {} };
export const authError = writable(null);
export const authToken = writable(null);
export const idToken = writable(null);
export const isAuthenticated = writable(false);
export const isLoading = writable(false);
export const userInfo = writable(null);

// Stub functions
export function login() {
  console.log('Auth0 login stub called - would redirect to login page');
  // In a real implementation, this would redirect to the Auth0 login page
}

export function logout() {
  console.log('Auth0 logout stub called - would log out the user');
  isAuthenticated.set(false);
  authToken.set(null);
  idToken.set(null);
  userInfo.set(null);
  // In a real implementation, this would redirect to the Auth0 logout endpoint
}

// Export additional functions that might be needed
export const auth0 = {
  isAuthenticated: () => false,
  getTokenSilently: async () => null,
  getIdTokenClaims: async () => null,
  loginWithRedirect: () => {},
  logout: () => {},
};

// Stub handler for Auth0 callbacks
export function handleAuth0Callback() {
  console.log('Auth0 callback stub called');
  return Promise.resolve(false);
}