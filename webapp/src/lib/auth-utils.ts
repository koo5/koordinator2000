import { redirect, type RequestEvent } from '@sveltejs/kit';

/**
 * Helper function to protect routes that require authentication
 * @param event - The event object from the load function
 * @returns null if authenticated
 * @throws Redirect to login page if not authenticated
 */
export function requireAuth(event: RequestEvent): null {
  // Check if user is authenticated
  const user = event.locals.user;
  
  if (!user) {
    // Redirect to login page with the current URL as the redirect target
    const redirectTo = encodeURIComponent(event.url.pathname);
    throw redirect(303, `/login?redirectTo=${redirectTo}`);
  }
  
  return null;
}

/**
 * Helper function to check if a user is authenticated
 * @param event - The event object from the load function
 * @returns true if authenticated, false otherwise
 */
export function isAuthenticated(event: RequestEvent): boolean {
  return !!event.locals.user;
}
