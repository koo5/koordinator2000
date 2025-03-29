/**
 * Route utilities for SvelteKit
 */
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import type { RequestEvent } from '@sveltejs/kit';
import { fetchData } from './data-utils';
import { requireAuth, createError } from './error-utils';

/**
 * Check if user is authenticated and redirect if not
 * 
 * @param event - SvelteKit request event
 */
export function checkAuth(event: RequestEvent): void {
  const { locals } = event;
  if (!locals.user) {
    requireAuth('You must be logged in to access this page', event.url.pathname);
  }
}

/**
 * Load data from the API in a standardized way
 * 
 * @param event - SvelteKit request event
 * @param endpoint - API endpoint to fetch
 * @param options - Fetch options
 * @returns Fetched data
 */
export async function loadFromApi<T = any>(
  event: RequestEvent, 
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const url = new URL(endpoint, event.url.origin).toString();
    const response = await event.fetch(url, options);
    return await response.json() as T;
  } catch (err) {
    console.error(`Error fetching from ${endpoint}:`, err);
    throw createError(500, 'Failed to load data from API');
  }
}

/**
 * Enhanced page navigation with error handling and loading state
 * 
 * @param path - Path to navigate to
 * @param options - Navigation options
 */
export async function navigate(
  path: string, 
  options: Record<string, any> = {}
): Promise<void> {
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
 * @param params - Query parameters object
 * @returns URL query string (including the ?)
 */
export function createQueryString(params: Record<string, any>): string {
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