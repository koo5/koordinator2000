import { requireAuth } from '$lib/auth-utils.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  // Check if user is authenticated
  requireAuth(event);
  
  // If we get here, the user is authenticated
  return {
    user: event.locals.user
  };
};