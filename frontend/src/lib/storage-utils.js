/**
 * Enhanced storage utilities for SvelteKit
 */
import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';

/**
 * Create a persistent store that syncs with localStorage
 * 
 * @template T
 * @param {string} key - localStorage key
 * @param {T} initialValue - Initial store value
 * @returns {import('svelte/store').Writable<T>} Svelte writable store
 */
export function persistentStore(key, initialValue) {
  // Only access localStorage in the browser
  const storedValue = browser ? 
    JSON.parse(localStorage.getItem(key) || 'null') : null;
  
  const store = writable(storedValue !== null ? storedValue : initialValue);
  
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
 * @template T
 * @param {string} key - sessionStorage key
 * @param {T} initialValue - Initial store value
 * @returns {import('svelte/store').Writable<T>} Svelte writable store
 */
export function sessionStore(key, initialValue) {
  // Only access sessionStorage in the browser
  const storedValue = browser ? 
    JSON.parse(sessionStorage.getItem(key) || 'null') : null;
  
  const store = writable(storedValue !== null ? storedValue : initialValue);
  
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
 * @template T
 * @param {T} initialValue - Initial store value
 * @param {number} timeoutMs - Timeout in milliseconds
 * @param {T} expiredValue - Value to set after timeout
 * @returns {import('svelte/store').Writable<T>} Svelte writable store
 */
export function timeoutStore(initialValue, timeoutMs, expiredValue) {
  const store = writable(initialValue);
  let timeoutId = null;
  
  function setTimeout() {
    if (browser && timeoutId === null) {
      timeoutId = window.setTimeout(() => {
        store.set(expiredValue);
        timeoutId = null;
      }, timeoutMs);
    }
  }
  
  function clearTimeout() {
    if (browser && timeoutId !== null) {
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
  
  // Start the timeout when created
  setTimeout();
  
  // Enhance the store with reset functionality
  return {
    ...store,
    reset: () => {
      clearTimeout();
      store.set(initialValue);
      setTimeout();
    },
    cancel: clearTimeout
  };
}