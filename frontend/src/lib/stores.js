import { writable } from 'svelte/store';
import { localStorageSharedStore } from '../svelte-shared-store';

export const debug = writable(false);
// User store
export const user = writable(null);

// Theme settings
export const theme = localStorageSharedStore('theme', {
  dark: false,
  saturate: 0
});

// Navigation state
export const isMenuOpen = writable(false);

// Notification store
export const notifications = writable([]);

// Add a notification
export function addNotification(message, type = 'info', timeout = 5000) {
  const id = Date.now();
  notifications.update(all => [{ id, message, type }, ...all]);
  
  if (timeout) {
    setTimeout(() => {
      removeNotification(id);
    }, timeout);
  }
  
  return id;
}

// Remove a notification
export function removeNotification(id) {
  notifications.update(all => all.filter(n => n.id !== id));
}
