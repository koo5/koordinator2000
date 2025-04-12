import {get, readable, type Readable, writable} from 'svelte/store';
import {localStorageSharedStore, type SharedStore} from './svelte-shared-store';
import {browser} from '$app/environment';
import EventEmitter from 'events';

/**
 * Auth event interface
 */
export interface AuthEvent {
    type: string;
    [key: string]: any;
}

/**
 * User object interface for the current user
 */
export interface MyUser {
    id: number;
    auth_debug?: boolean;
    nag_postponement?: number;
    nag_backoff?: number;
    default_participations_display_style?: string;
    settings?: {
        autoscroll?: boolean;
        [key: string]: any;
    };

    [key: string]: any;
}

/**
 * Campaign participation interface
 */
export interface Participation {
    id?: number;
    user_id?: number;
    campaign_id?: number;
    status?: string;

    [key: string]: any;
}

/**
 * Campaign interface
 */
export interface Campaign {
    id: number;
    title?: string;
    slug?: string;
    my_participations?: Participation[];

    [key: string]: any;
}

/**
 * Auth user response
 */
export interface AuthUserResponse {
    id: number;

    [key: string]: any;
}

// Define the store type, which will be different based on browser vs server
type MyUserStore = typeof browser extends true ? SharedStore<MyUser> : Readable<MyUser>;

// Create the appropriate store based on environment
export const my_user: MyUserStore = browser ? 
    localStorageSharedStore<MyUser>('my_user', {
        id: 0,
        settings: {
            autoscroll: true
        }
    }) : 
    readable<MyUser>({
        id: -1,
        settings: {
            autoscroll: true
        }
    });

export const is_user = writable<boolean>(false);
my_user.subscribe((user) => {
    if (user?.id > 0) {
        is_user.set(true);
    } else {
        is_user.set(false);
    }
});

/**
 * Impersonate another user (for development)
 * @param _id - User ID to impersonate
 */
export function impersonate(_id: number): void {
    // Cast to writable type since we know this is only called in browser
    (my_user as SharedStore<MyUser>).set({id: _id});
}

// Track requests to prevent multiple simultaneous user creations
let userCreationInProgress = false;
let lastUserCreationAttempt = 0;
const USER_CREATION_COOLDOWN = 10000; // 10 seconds

/**
 * Creates a new user through the server endpoint
 * This function is completely independent of GraphQL
 * @returns Promise with the new user object
 */
async function new_user(): Promise<AuthUserResponse> {
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
        console.log('get(my_user):', get(my_user));
        const res = await fetch('/get_free_user_id', {
            method: 'POST',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + get(my_user)?.jwt
            },
        });

        // Clear the timeout
        clearTimeout(timeoutId);

        // Handle unsuccessful responses
        if (!res.ok) {
            throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        // Parse and validate the response
        const result = (await res.json()) as AuthUserResponse;
        if (!result || typeof result.id !== 'number' || result.id <= 0) {
            throw new Error('Invalid user response: missing or invalid id property');
        }

        console.log('Successfully created new user with ID:', result.id);
        return result;
    } catch (error: any) {
        console.error('Error creating new user:', error.message);
        throw error;
    } finally {
        // Always reset the in-progress flag, even if there was an error
        userCreationInProgress = false;
    }
}

/**
 * Send an authentication event to the server
 * @param event - The authentication event to send
 * @returns Promise with the server response
 */
export async function auth_event(event: AuthEvent): Promise<any> {
    //console.log('/event');
    //console.log(event);
    let res;
    let res2;
    try {
        res = fetch('/auth_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            mode: 'same-origin',
            body: JSON.stringify({event: event}),
        });
        //console.log("res:" + (typeof res) + ":" + JSON.stringify(res, null, '  '));
        res = await res;
        //console.log("res:" + (typeof res) + ":" + JSON.stringify(res, null, '  '));
        try {
            res2 = await res.json();
        } catch (ee) {
            // Silent failure on JSON parse error
        }
        //console.log("res2:" + (typeof res2) + ":" + JSON.stringify(res2, null, '  '));
    } catch (e) {
        console.error(e);
    }
    return res2;
}


export async function create_user(only_on_first_visit: boolean): Promise<void> {
    const user = get(my_user);
    if (user.auth_debug) console.log('i am ' + JSON.stringify(user, null, '  '));
    try {
        let u;
        if (!user.id || user.id === -1) {
            if (user.id === -1) {
                console.log('User had logged out');
            }
            if (user.id === -1 && !only_on_first_visit) {
                console.log('Creating new user...');
            }
            if (!user.id || !only_on_first_visit) {
                u = await create_user2();
            } else {
                console.log('Not creating new user now');
            }
        } else {
            console.log('User exists (ID:', user.id + ')');
            return;
        }
        if (u) {
            await apply_newly_authenticated_user(u);
        }
    } catch (e) {
        console.error('Error during user initialization:', e);
    }
}

/**
 * Ensure the current user exists, creating one if necessary
 * @returns Promise with user data or null
 */
export async function create_user2(): Promise<AuthUserResponse | null> {
    // Only attempt to create a new user if we don't have a valid ID
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

/**
 * Apply a newly authenticated user to the user store
 * @param newly_authenticated_user - The authenticated user data
 * @returns Promise with success status
 */
export async function apply_newly_authenticated_user(newly_authenticated_user: AuthUserResponse | null): Promise<boolean> {
    // Only apply if we actually have a valid user with ID
    if (newly_authenticated_user && newly_authenticated_user.id > 0) {
        console.log('Applying new authenticated user with ID:', newly_authenticated_user.id);
        (my_user as SharedStore<MyUser>).set(newly_authenticated_user as MyUser);
        return true;
    } else {
        console.warn('Not applying invalid user data:', newly_authenticated_user);
        return false;
    }
}

/**
 * Log out the current user
 * @returns Promise that resolves when logout is complete
 */
export async function logout(): Promise<void> {
    (my_user as SharedStore<MyUser>).set({id: -1});
    // The auth_logout() function doesn't exist, so we're removing this call
}

/**
 * Get the user's participation in a campaign
 * @param campaign - The campaign object
 * @param user - The user object
 * @returns The participation object or empty object
 */
export function get_my_participation(campaign: Campaign | null | undefined, user: MyUser): Participation {
    if (!campaign) return {};
    if (!campaign.my_participations) return {};
    if (campaign.my_participations.length === 1) {
        const p = campaign.my_participations[0];
        return p;
    } else if (campaign.my_participations.length === 0) return {};
    else {
        console.log(campaign.my_participations);
        alert('database error, this shouldnt happen: (campaign.my_participations.length > 1)');
        return {};
    }
}

/**
 * Get the default participations display style
 * @param user - The user object
 * @returns The display style string
 */
export function default_participations_display_style(user: MyUser): string {
    if (user.default_participations_display_style) return user.default_participations_display_style;
    return 'tabular_breakdown';
}

// Define custom type for event emitter
interface NagEventMap {
    nag: () => void;
}

// Create a properly typed EventEmitter
export const nag = new EventEmitter() as EventEmitter & {
    emit<K extends keyof NagEventMap>(event: K, ...args: Parameters<NagEventMap[K]>): boolean;
};

let nag_timeout: ReturnType<typeof setTimeout> | undefined = undefined;

/**
 * Decrease the authentication nag postponement counter
 */
export function decrease_auth_nag_postponement(): void {
    console.log('decrease_auth_nag_postponement');
    (my_user as SharedStore<MyUser>).update(x => ({...x, nag_postponement: (x.nag_postponement || 0) - 1}));
    const $my_user = get(my_user);
    if ($my_user.nag_postponement !== undefined && $my_user.nag_postponement <= 0) {
        if (nag_timeout) clearTimeout(nag_timeout);
        nag_timeout = setTimeout(() => {
            nag_timeout = undefined;
            nag.emit('nag');
        }, 1000);
    }
}

/**
 * Postpone the authentication nag
 * @param by - Number of time units to postpone by (default: 15)
 */
export function postpone_nag(by: number = 15): void {
    let backoff = get(my_user).nag_backoff || 3;
    (my_user as SharedStore<MyUser>).update(x => ({
        ...x,
        nag_postponement: (x.nag_postponement || 0) + backoff + by,
        nag_backoff: backoff + 15,
    }));
}
