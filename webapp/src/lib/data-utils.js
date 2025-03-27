/**
 * Data fetching utilities for SvelteKit
 */
import { browser } from '$app/environment';
import { handleApiResponse } from './error-utils';

/**
 * Enhanced fetch function with automatic error handling and JSON parsing
 * 
 * @param {RequestInfo} url - URL to fetch
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function fetchData(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  return handleApiResponse(response);
}

/**
 * Create a function to fetch data with a specific API endpoint
 * 
 * @param {string} baseUrl - Base URL for API
 * @returns {(path: string, options?: RequestInit) => Promise<any>} Function to fetch from the API
 */
export function createApiClient(baseUrl) {
  return (path, options = {}) => {
    const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
    return fetchData(url, options);
  };
}

/**
 * Load data safely for both server and client rendering
 * 
 * @param {Function} loadFn - Function that returns data
 * @param {any} fallback - Fallback value if loading fails
 * @returns {Promise<any>} The loaded data or fallback
 */
export async function safeLoad(loadFn, fallback = null) {
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
 * @param {Function} clientFn - Function to call in browser
 * @param {Function} serverFn - Function to call on server
 * @returns {Promise<any>} Result of the appropriate function
 */
export async function conditionalLoad(clientFn, serverFn) {
  return browser ? await clientFn() : await serverFn();
}