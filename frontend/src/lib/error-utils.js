/**
 * Error handling utilities for SvelteKit
 */
import { redirect, error } from '@sveltejs/kit';

/**
 * Create a standardized error object with optional details
 * 
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {Record<string, any>} [details] - Additional error details
 * @returns {import('@sveltejs/kit').Error} - SvelteKit error object
 */
export function createError(status, message, details = {}) {
  console.error(`Error ${status}: ${message}`, details);
  return error(status, {
    message,
    ...details
  });
}

/**
 * Handle authentication errors by redirecting to login
 * 
 * @param {string} [message='Authentication required'] - Error message
 * @param {string} [returnUrl='/'] - URL to return to after login
 * @returns {never} - This function never returns normally
 * @throws {import('@sveltejs/kit').Redirect} - Throws a redirect to login
 */
export function requireAuth(message = 'Authentication required', returnUrl = '/') {
  const encodedReturnUrl = encodeURIComponent(returnUrl);
  throw redirect(307, `/login?error=${encodeURIComponent(message)}&returnUrl=${encodedReturnUrl}`);
}

/**
 * Handle API errors from fetch responses
 * 
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} - Response data if successful
 * @throws {import('@sveltejs/kit').Error} - Throws a SvelteKit error if response is not ok
 */
export async function handleApiResponse(response) {
  if (!response.ok) {
    let errorData = { message: 'Unknown error' };
    
    try {
      errorData = await response.json();
    } catch (e) {
      // If we can't parse JSON, use text
      try {
        const text = await response.text();
        errorData.message = text || `Error ${response.status}`;
      } catch (textError) {
        // If we can't get text either, use status
        errorData.message = `API error: ${response.statusText || response.status}`;
      }
    }
    
    throw createError(
      response.status, 
      errorData.message || 'API request failed',
      { details: errorData }
    );
  }
  
  return response.json();
}