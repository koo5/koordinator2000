/**
 * Error handling utilities for SvelteKit
 */
import { redirect, error, type HttpError } from '@sveltejs/kit';

/**
 * Error data interface
 */
interface ErrorData {
  message: string;
  [key: string]: any;
}

/**
 * Create a standardized error object with optional details
 * 
 * @param status - HTTP status code
 * @param message - Error message
 * @param details - Additional error details
 * @returns SvelteKit error object
 */
export function createError(
  status: number, 
  message: string, 
  details: Record<string, any> = {}
): HttpError {
  console.error(`Error ${status}: ${message}`, details);
  return error(status, {
    message,
    ...details
  });
}

/**
 * Handle authentication errors by redirecting to login
 * 
 * @param message - Error message
 * @param returnUrl - URL to return to after login
 * @returns This function never returns normally
 * @throws Redirect - Throws a redirect to login
 */
export function requireAuth(
  message: string = 'Authentication required', 
  returnUrl: string = '/'
): never {
  const encodedReturnUrl = encodeURIComponent(returnUrl);
  throw redirect(307, `/login?error=${encodeURIComponent(message)}&returnUrl=${encodedReturnUrl}`);
}

/**
 * Handle API errors from fetch responses
 * 
 * @param response - Fetch response object
 * @returns Response data if successful
 * @throws HttpError - Throws a SvelteKit error if response is not ok
 */
export async function handleApiResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ErrorData = { message: 'Unknown error' };
    
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
  
  return response.json() as Promise<T>;
}