import { readable, writable, get, type Writable } from 'svelte/store';
import { localStorageSharedStore } from './svelte-shared-store';
import { goto } from '$app/navigation';
import { logout as auth0_logout } from '@dopry/svelte-auth0';
import { EventDispatcher } from './event_dispatcher.js';
import { browser } from '$app/environment';
import type { User } from './types/user';
import type { Campaign, Participation } from './types/campaign';

export const my_user: Writable<User> = browser
  ? localStorageSharedStore('my_user', { id: -1, auth_debug: false })
  : writable({ id: 0 }) as Writable<User>;

export function impersonate(_id: number): void {
  my_user.set({ id: _id });
}

// Track requests to prevent multiple simultaneous user creations
let userCreationInProgress = false;
let lastUserCreationAttempt = 0;
const USER_CREATION_COOLDOWN = 10000; // 10 seconds

/**
 * Creates a new user through the server endpoint
 * This function is completely independent of GraphQL
 */
async function new_user(): Promise<User | null> {
  const now = Date.now();
  
  // Prevent multiple concurrent requests
  if (userCreationInProgress) {
    console.warn('User creation already in progress, skipping duplicate request');
    throw new Error('User creation already in progress');
  }
  
  // Rate limit user creation attempts
  if (now - lastUserCreationAttempt < USER_CREATION_COOLDOWN) {
    console.warn('Too many user creation attempts, please wait before trying again');
    throw new Error('User creation rate limit exceeded');
  }
  
  // Update timestamps and flags
  userCreationInProgress = true;
  lastUserCreationAttempt = now;
  
  try {
    // Set a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    console.log('Attempting to create new user...');
    const res = await fetch('/get_free_user_id', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    // Handle unsuccessful responses
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    
    // Parse and validate the response
    const result = await res.json();
    if (!result || typeof result.id !== 'number' || result.id <= 0) {
      throw new Error('Invalid user response: missing or invalid id property');
    }
    
    console.log("Successfully created new user with ID:", result.id);
    return result as User;
  } 
  catch (error: any) {
    console.error("Error creating new user:", error.message);
    throw error;
  }
  finally {
    // Always reset the in-progress flag, even if there was an error
    userCreationInProgress = false;
  }
}

export async function event(event: any): Promise<any> {
  let res;
  let res2;
  try {
    res = fetch('/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: "same-origin",
      body: JSON.stringify({ event: event })
    });
    
    res = await res;
    try {
      res2 = await res.json();
    } catch (ee) {
      // Silently handle JSON parsing error
    }
  } catch (e) {
    console.error(e);
  }
  return res2;
}

// User registration is completely independent of GraphQL 
// and should be handled separately
export async function ensure_we_exist(): Promise<User | null> {
  const user = get(my_user);
  if (user.auth_debug)
    console.log('i am ' + JSON.stringify(user, null, '  '));
  
  // Only attempt to create a new user if we don't have a valid ID
  if (user.id < 1) {
    try {
      // Try to create a new user using the server endpoint
      const result = await new_user();
      if (result && result.id > 0) {
        console.log('Created new user with ID:', result.id);
        return result;
      } else {
        console.error('Failed to create new user: Invalid response');
        return null;
      }
    } catch (e) {
      console.error('Error during user creation:', e);
      return null;
    }
  }
  else {
    // User already exists
    console.log('User already exists with ID:', user.id);
    return null;
  }
}

export async function apply_newly_authenticated_user(newly_authenticated_user: User | null): Promise<boolean> {
  // Only apply if we actually have a valid user with ID
  if (newly_authenticated_user && newly_authenticated_user.id > 0) {
    console.log('Applying new authenticated user with ID:', newly_authenticated_user.id);
    my_user.set(newly_authenticated_user);
    return true;
  } else {
    console.warn('Not applying invalid user data:', newly_authenticated_user);
    return false;
  }
}

export async function logout(): Promise<void> {
  my_user.set({ id: -1 });
  await auth0_logout();
}

export function get_my_participation(campaign: Campaign | undefined, my_user: User): Participation {
  if (!campaign)
    return {} as Participation;
  if (!campaign.my_participations)
    return {} as Participation;
  if (campaign.my_participations.length == 1) {
    let p = campaign.my_participations[0];
    return p;
  }
  else if (campaign.my_participations.length == 0)
    return {} as Participation;
  else {
    console.log(campaign.my_participations);
    alert('database error, this shouldnt happen: (campaign.my_participations.length > 1)');
    return {} as Participation;
  }
}

export async function register(): Promise<void> {
  try {
    await apply_newly_authenticated_user(await ensure_we_exist());
    goto('/you');
  } catch (e) {
    console.log(e);
  }
}

export function default_participations_display_style(my_user: User): string {
  if (my_user.default_participations_display_style)
    return my_user.default_participations_display_style;
  return "tabular_breakdown";
}

export const nag = new EventDispatcher();
let nag_timeout: ReturnType<typeof setTimeout> | undefined = undefined;

export function decrease_auth_nag_postponement(): void {
  console.log('decrease_auth_nag_postponement');
  my_user.update(x => ({ ...x, 'nag_postponement': (x.nag_postponement || 0) - 1 }));
  const $my_user = get(my_user);
  if ($my_user.nag_postponement <= 0) {
    if (nag_timeout) clearTimeout(nag_timeout);
    nag_timeout = setTimeout(() => {
      nag_timeout = undefined;
      nag.trigger();
    }, 1000);
  }
}

export function postpone_nag(by = 15): void {
  let backoff = (get(my_user).nag_backoff || 3);
  my_user.update(x => ({
    ...x,
    'nag_postponement': (x.nag_postponement || 0) + backoff + by,
    nag_backoff: backoff + 15
  }));
}