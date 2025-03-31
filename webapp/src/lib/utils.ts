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
 */
export { browser } from '$app/environment';

/**
 * Date format options type
 */
type DateFormatOptions = {
    dateStyle?: 'short' | 'medium' | 'long' | 'full';
    timeStyle?: 'short' | 'medium' | 'long' | 'full';
};

/**
 * Format options keyed by format name
 */
type FormatOptionsMap = {
    [key: string]: DateFormatOptions;
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(deepClone) as unknown as T;
    }

    const cloned = {} as Record<string, any>;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone((obj as Record<string, any>)[key]);
        }
    }

    return cloned as T;
}

/**
 * Format a date using Intl.DateTimeFormat
 * @param date - Date to format
 * @param format - Format string: 'short', 'medium', 'long', 'full', 'time', 'datetime'
 * @param locale - Locale string (defaults to browser locale)
 * @returns Formatted date
 */
export function formatDate(date: Date | string | number, format: string = 'medium', locale?: string): string {
    const dateObj = date instanceof Date ? date : new Date(date);

    const options: FormatOptionsMap = {
        short: { dateStyle: 'short' },
        medium: { dateStyle: 'medium' },
        long: { dateStyle: 'long' },
        full: { dateStyle: 'full' },
        time: { timeStyle: 'short' },
        datetime: { dateStyle: 'medium', timeStyle: 'short' },
    };

    return new Intl.DateTimeFormat(locale, options[format] || options.medium).format(dateObj);
}

/**
 * Debounce a function call
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    return function (this: any, ...args: Parameters<T>): void {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * Generate a random ID string
 * @param length - Length of the ID
 * @returns Random ID
 */
export function generateId(length: number = 8): string {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}
