import { redirect } from '@sveltejs/kit';

/**
 * Helper function to protect routes that require authentication
 * @param {Object} event - The event object from the load function
 * @returns {Object|null} - Returns null if authenticated, or a redirect object if not
 */
export function requireAuth(event) {
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
 * @param {Object} event - The event object from the load function
 * @returns {boolean} - Returns true if authenticated, false otherwise
 */
export function isAuthenticated(event) {
  return !!event.locals.user;
}
