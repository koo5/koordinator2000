import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    // Get user from parent layout
    const { user } = await parent();

    // If user is not authenticated, the parent layout will handle the redirect
    return { user };
};
