/**
 * Data fetching utilities for SvelteKit
 */
import { browser } from '$app/environment';
import { handleApiResponse } from './error-utils';

/**
 * Enhanced fetch function with automatic error handling and JSON parsing
 *
 * @param url - URL to fetch
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function fetchData<T = any>(url: RequestInfo, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    return handleApiResponse<T>(response);
}

/**
 * Type for the API client function
 */
export type ApiClientFn = <T = any>(path: string, options?: RequestInit) => Promise<T>;

/**
 * Create a function to fetch data with a specific API endpoint
 *
 * @param baseUrl - Base URL for API
 * @returns Function to fetch from the API
 */
export function createApiClient(baseUrl: string): ApiClientFn {
    return <T = any>(path: string, options: RequestInit = {}): Promise<T> => {
        const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
        return fetchData<T>(url, options);
    };
}

/**
 * Load data safely for both server and client rendering
 *
 * @param loadFn - Function that returns data
 * @param fallback - Fallback value if loading fails
 * @returns The loaded data or fallback
 */
export async function safeLoad<T, F = null>(loadFn: () => Promise<T>, fallback: F = null as unknown as F): Promise<T | F> {
    try {
        return await loadFn();
    } catch (error) {
        console.error('Error loading data:', error);
        return fallback;
    }
}

/**
 * Conditionally load data based on browser environment
 *
 * @param clientFn - Function to call in browser
 * @param serverFn - Function to call on server
 * @returns Result of the appropriate function
 */
export async function conditionalLoad<T>(clientFn: () => Promise<T>, serverFn: () => Promise<T>): Promise<T> {
    return browser ? await clientFn() : await serverFn();
}
