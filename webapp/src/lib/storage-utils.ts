/**
 * Enhanced storage utilities for SvelteKit
 */
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

/**
 * Enhanced timeout store interface
 */
export interface TimeoutStore<T> extends Writable<T> {
    reset: () => void;
    cancel: () => void;
}

/**
 * Create a persistent store that syncs with localStorage
 *
 * @param key - localStorage key
 * @param initialValue - Initial store value
 * @returns Svelte writable store
 */
export function persistentStore<T>(key: string, initialValue: T): Writable<T> {
    // Only access localStorage in the browser
    const storedValue = browser ? (JSON.parse(localStorage.getItem(key) || 'null') as T | null) : null;

    const store = writable<T>(storedValue !== null ? storedValue : initialValue);

    // Subscribe to changes and update localStorage
    if (browser) {
        store.subscribe(value => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
}

/**
 * Create a session store that persists for the current session only
 *
 * @param key - sessionStorage key
 * @param initialValue - Initial store value
 * @returns Svelte writable store
 */
export function sessionStore<T>(key: string, initialValue: T): Writable<T> {
    // Only access sessionStorage in the browser
    const storedValue = browser ? (JSON.parse(sessionStorage.getItem(key) || 'null') as T | null) : null;

    const store = writable<T>(storedValue !== null ? storedValue : initialValue);

    // Subscribe to changes and update sessionStorage
    if (browser) {
        store.subscribe(value => {
            sessionStorage.setItem(key, JSON.stringify(value));
        });
    }

    return store;
}

/**
 * Create a store with timeout that automatically expires
 *
 * @param initialValue - Initial store value
 * @param timeoutMs - Timeout in milliseconds
 * @param expiredValue - Value to set after timeout
 * @returns Enhanced Svelte writable store with reset and cancel methods
 */
export function timeoutStore<T>(initialValue: T, timeoutMs: number, expiredValue: T): TimeoutStore<T> {
    const store = writable<T>(initialValue);
    let timeoutId: number | null = null;

    function setTimeoutFn(): void {
        if (browser && timeoutId === null) {
            timeoutId = window.setTimeout(() => {
                store.set(expiredValue);
                timeoutId = null;
            }, timeoutMs);
        }
    }

    function clearTimeoutFn(): void {
        if (browser && timeoutId !== null) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
    }

    // Start the timeout when created
    setTimeoutFn();

    // Enhance the store with reset functionality
    return {
        ...store,
        reset: () => {
            clearTimeoutFn();
            store.set(initialValue);
            setTimeoutFn();
        },
        cancel: clearTimeoutFn,
    };
}
