import { requireAuth } from '$lib/auth-utils';

/** @type {import('./$types').PageLoad} */
export async function load(event) {
  // Check if user is authenticated
  requireAuth(event);
  
  // If we get here, the user is authenticated
  return {
    user: event.locals.user
  };
}
