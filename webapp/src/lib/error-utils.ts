/**
 * Error utilities for SvelteKit applications
 */
import type { RequestEvent } from '@sveltejs/kit';

/**
 * Standard error shape for API responses
 */
export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, any>;
}

/**
 * Create a standard error object
 */
export function createError(
  status: number, 
  message: string, 
  details?: Record<string, any>
): ApiError {
  return {
    status,
    message,
    details
  };
}

/**
 * Check if the user is authenticated
 * Throws an error if not
 */
export function requireAuth(event: RequestEvent): void {
  const user = event.locals.user;
  
  if (!user || !user.id) {
    throw createError(401, 'Authentication required');
  }
}

/**
 * Handle errors consistently in API routes
 */
export function handleApiError(error: unknown): ApiError {
  console.error('API error:', error);
  
  if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
    return error as ApiError;
  }
  
  return createError(
    500,
    typeof error === 'string' 
      ? error 
      : error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
  );
}

/**
 * Format user-facing error messages
 */
export function formatErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  
  return typeof error === 'string' 
    ? error 
    : 'An unexpected error occurred';
}