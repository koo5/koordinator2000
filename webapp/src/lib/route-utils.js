/**
 * Route utilities for SvelteKit
 */
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { fetchData } from './data-utils';
import { requireAuth, createError } from './error-utils';

/**
 * Check if user is authenticated and redirect if not
 * 
 * @param {import('@sveltejs/kit').LoadEvent} event - SvelteKit load event
 * @returns {void}
 */
export function checkAuth(event) {
  const { locals } = event;
  if (!locals.user) {
    requireAuth('You must be logged in to access this page', event.url.pathname);
  }
}

/**
 * Load data from the API in a standardized way
 * 
 * @param {import('@sveltejs/kit').LoadEvent} event - SvelteKit load event
 * @param {string} endpoint - API endpoint to fetch
 * @param {RequestInit} [options] - Fetch options
 * @returns {Promise<any>} Fetched data
 */
export async function loadFromApi(event, endpoint, options = {}) {
  try {
    const url = new URL(endpoint, event.url.origin).toString();
    const response = await event.fetch(url, options);
    return await response.json();
  } catch (err) {
    console.error(`Error fetching from ${endpoint}:`, err);
    throw createError(500, 'Failed to load data from API');
  }
}

/**
 * Enhanced page navigation with error handling and loading state
 * 
 * @param {string} path - Path to navigate to
 * @param {NavigationOptions} [options] - Navigation options
 * @returns {Promise<void>}
 */
export async function navigate(path, options = {}) {
  try {
    await goto(path, options);
  } catch (err) {
    console.error('Navigation error:', err);
    // Could add fallback behavior here
  }
}

/**
 * Create query parameters string from an object
 * 
 * @param {Record<string, any>} params - Query parameters object
 * @returns {string} URL query string (including the ?)
 */
export function createQueryString(params) {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}