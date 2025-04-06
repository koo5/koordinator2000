import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { my_user, type MyUser } from './my_user';
import { parseJwt } from './jwt-utils';
import type { SharedStore } from './svelte-shared-store';

// Configuration
const TOKEN_CHECK_INTERVAL = 1000*60*60*1;
const TOKEN_RENEWAL_BUFFER = 60 * 60 * 24 * 14;
let tokenCheckTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Renew the JWT token for the current user
 * @returns Promise that resolves when token is renewed, or rejects on error
 */
export async function renewJwt(): Promise<void> {
  if (!browser) return;

  try {
    // Get current user and token
    const currentUser = get(my_user);

    // Don't renew if user is not logged in
    if (!currentUser?.id || currentUser.id <= 0) {
      console.log('No active user session, skipping token renewal');
      return;
    }

    console.log('Attempting to renew JWT token...');
    console.log('Current JWT:', currentUser.jwt);

    // Call the renewal endpoint
    const response = await fetch('/api/renew-jwt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.jwt}`
      }
    });

    // Handle rate limiting - server returns 429 if token doesn't need renewal yet
    if (response.status === 429) {
      const data = await response.json();
      console.log(`Token renewal not needed yet. Expires in ${data.expiresIn} seconds.`);
      return;
    }

    if (!response.ok) {
      throw new Error(`JWT renewal failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result?.user?.jwt) {
      throw new Error('JWT renewal response missing token');
    }

    // Update the user store with the new token
    (my_user as SharedStore<MyUser>).update(user => ({
      ...user,
      jwt: result.user.jwt
    }));

    console.log('JWT token renewed successfully');
  } catch (error) {
    console.error('Failed to renew JWT token:', error);
    throw error;
  }
}

/**
 * Check if the current JWT token needs renewal and renew if needed
 * @returns Promise that resolves when check is complete
 */
export async function checkAndRenewJwt(): Promise<void> {
  if (!browser) return;

  try {
    const currentUser = get(my_user);

    // Skip if no user or no token
    if (!currentUser?.id || !currentUser.jwt) {
      return;
    }

    // Get the current token
    const token = currentUser.jwt;
    if (!token) {
      console.error('No JWT token found, nothing to renew');
      return;
    }
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
        console.error('Invalid JWT payload or missing expiration time, nothing to renew');
    }

    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expiresAt = payload.exp;

    const remaining = expiresAt - now;

    // Check if the token is already expired
    if (remaining <= 0) {
      console.log('JWT token has expired, logging out');
      // Reset user to logged out state
      (my_user as SharedStore<MyUser>).set({id: -1});
      return;
    }
    
    // Check if the token is expiring soon
    if (remaining <= TOKEN_RENEWAL_BUFFER) {
      console.log('JWT token is expiring soon, renewing...');
      await renewJwt();
    } else {
      console.log(`JWT token expires in ${remaining} seconds.`);
    }

  } catch (error) {
    console.error('Error during JWT renewal check:', error);
  }
}

/**
 * Start the JWT renewal service
 * This will periodically check and renew the JWT token
 */
export function startJwtRenewalService(): void {
  if (!browser) return;

  // Clean up any existing timer
  stopJwtRenewalService();

  console.log('Starting JWT renewal service');

  // Perform initial check
  checkAndRenewJwt();

  // Set up periodic check
  tokenCheckTimer = setInterval(checkAndRenewJwt, TOKEN_CHECK_INTERVAL);
}

/**
 * Stop the JWT renewal service
 */
export function stopJwtRenewalService(): void {
  if (tokenCheckTimer) {
    clearInterval(tokenCheckTimer);
    tokenCheckTimer = null;
    console.log('JWT renewal service stopped');
  }
}
