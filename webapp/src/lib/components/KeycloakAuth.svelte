<script>
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { initializeKeycloak, updateToken, logout } from '$lib/server/keycloak';
  
  // Create Svelte stores for authentication state
  export const isAuthenticated = writable(false);
  export const userProfile = writable(null);
  export const keycloakInstance = writable(null);
  
  // Token refresh interval in seconds
  const tokenRefreshInterval = 60;
  let refreshInterval;
  let mounted = false;
  
  onMount(async () => {
    mounted = true;
    try {
      // Initialize Keycloak
      const { keycloak, authenticated } = await initializeKeycloak();
      
      // Update stores
      keycloakInstance.set(keycloak);
      isAuthenticated.set(authenticated);
      
      if (authenticated) {
        // Load user profile if authenticated
        const profile = await keycloak.loadUserProfile();
        userProfile.set(profile);
        
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
          keycloak.loadUserProfile().then(profile => {
            userProfile.set(profile);
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
        updateToken().catch(() => {
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