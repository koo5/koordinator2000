import { writable, type Writable } from 'svelte/store';
import { localStorageSharedStore } from '../svelte-shared-store';

/**
 * User type for user store
 */
export interface User {
  id?: number;
  name?: string;
  email?: string;
  jwt?: string;
  [key: string]: any;
}

/**
 * Theme settings interface
 */
export interface ThemeSettings {
  dark: boolean;
  saturate: number;
}

/**
 * Notification type
 */
export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Debug flag
export const debug: Writable<boolean> = writable(true);

// User store
export const user: Writable<User | null> = writable(null);

// Theme settings
export const theme = localStorageSharedStore<ThemeSettings>('theme', {
  dark: false,
  saturate: 0
});

// Navigation state
export const isMenuOpen: Writable<boolean> = writable(false);

// Notification store
export const notifications: Writable<Notification[]> = writable([]);

/**
 * Add a notification
 * @param message - Notification message
 * @param type - Notification type
 * @param timeout - Timeout in milliseconds (0 for no timeout)
 * @returns Notification ID
 */
export function addNotification(
  message: string, 
  type: 'info' | 'success' | 'warning' | 'error' = 'info', 
  timeout: number = 5000
): number {
  const id = Date.now();
  notifications.update(all => [{ id, message, type }, ...all]);
  
  if (timeout) {
    setTimeout(() => {
      removeNotification(id);
    }, timeout);
  }
  
  return id;
}

/**
 * Remove a notification
 * @param id - Notification ID to remove
 */
export function removeNotification(id: number): void {
  notifications.update(all => all.filter(n => n.id !== id));
}
