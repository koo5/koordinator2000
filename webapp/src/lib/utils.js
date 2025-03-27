/**
 * Core utilities for SvelteKit
 * This file exports all the utilities in one place for easy importing
 */

// Navigation and routing
export * from './route-utils';

// Data fetching
export * from './data-utils';

// Form handling
export * from './form-utils';

// Error handling
export * from './error-utils';

// Storage and state
export * from './storage-utils';

// Version checking
export { checkVersions, initVersionCheck } from './version-check';

/**
 * Check if we're in the browser environment
 * @type {boolean}
 */
export { browser } from '$app/environment';

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  }
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Format a date using Intl.DateTimeFormat
 * @param {Date|string|number} date - Date to format
 * @param {string} [format='medium'] - Format string: 'short', 'medium', 'long', 'full'
 * @param {string} [locale] - Locale string (defaults to browser locale)
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'medium', locale = undefined) {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options = {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long' },
    full: { dateStyle: 'full' },
    time: { timeStyle: 'short' },
    datetime: { dateStyle: 'medium', timeStyle: 'short' }
  };
  
  return new Intl.DateTimeFormat(locale, options[format] || options.medium).format(dateObj);
}

/**
 * Debounce a function call
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Generate a random ID string
 * @param {number} [length=8] - Length of the ID
 * @returns {string} Random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}