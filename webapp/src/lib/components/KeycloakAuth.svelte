<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { writable, type Writable } from 'svelte/store';
  import { initializeKeycloak, updateToken, logout } from '$lib/server/keycloak';
  
  // Define Keycloak related interfaces
  interface KeycloakProfile {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  }

  interface Keycloak {
    token?: string;
    refreshToken?: string;
    idToken?: string;
    subject?: string;
    authenticated?: boolean;
    loadUserProfile(): Promise<KeycloakProfile>;
    login(options?: any): void;
    logout(options?: any): void;
    updateToken(minValidity: number): Promise<boolean>;
    onAuthSuccess?: () => void;
    onAuthError?: () => void;
    onAuthRefreshSuccess?: () => void;
    onAuthRefreshError?: () => void;
    onAuthLogout?: () => void;
    onTokenExpired?: () => void;
    [key: string]: any;
  }
  
  interface KeycloakInitResult {
    keycloak: Keycloak;
    authenticated: boolean;
  }

  // Create Svelte stores for authentication state
  export const isAuthenticated: Writable<boolean> = writable(false);
  export const userProfile: Writable<KeycloakProfile | null> = writable(null);
  export const keycloakInstance: Writable<Keycloak | null> = writable(null);
  
  // Token refresh interval in seconds
  const tokenRefreshInterval = 60;
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let mounted = false;
  
  onMount(async () => {
    mounted = true;
    try {
      // Initialize Keycloak
      const { keycloak, authenticated } = await initializeKeycloak() as KeycloakInitResult;
      
      // Update stores
      keycloakInstance.set(keycloak);
      isAuthenticated.set(authenticated);
      
      if (authenticated) {
        // Load user profile if authenticated
        try {
          const profile = await keycloak.loadUserProfile();
          userProfile.set(profile);
        } catch (profileError) {
          console.error('Failed to load user profile', profileError);
        }
        
        // Set up token refresh interval
        refreshInterval = setInterval(() => {
          updateToken(tokenRefreshInterval).catch(() => {
            // If token refresh fails, log out the user
            console.error('Failed to refresh token');
            logout();
          });
        }, tokenRefreshInterval * 1000);
      }
      
      // Add event listeners
      keycloak.onAuthSuccess = () => {
        if (mounted) {
          isAuthenticated.set(true);
          keycloak.loadUserProfile().then((profile: KeycloakProfile) => {
            userProfile.set(profile);
          }).catch((err: Error) => {
            console.error('Failed to load user profile', err);
          });
        }
      };
      
      keycloak.onAuthError = () => {
        if (mounted) {
          console.error('Authentication error');
          isAuthenticated.set(false);
          userProfile.set(null);
        }
      };
      
      keycloak.onAuthRefreshSuccess = () => {
        console.log('Token refreshed successfully');
      };
      
      keycloak.onAuthRefreshError = () => {
        console.error('Failed to refresh token');
        if (mounted) {
          logout();
        }
      };
      
      keycloak.onAuthLogout = () => {
        if (mounted) {
          isAuthenticated.set(false);
          userProfile.set(null);
        }
      };
      
      keycloak.onTokenExpired = () => {
        console.log('Token expired');
        updateToken().catch((err: Error) => {
          console.error('Token refresh failed after expiry', err);
          if (mounted) {
            logout();
          }
        });
      };
      
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
    }
  });
  
  onDestroy(() => {
    mounted = false;
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
</script>

<!-- This component doesn't render anything, it just manages authentication state -->