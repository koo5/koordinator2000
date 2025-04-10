import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }: { data: any }) => {
    // Pass session data from parent layout directly (enables passing auth data)
    return {
        session: data?.session || {},
        user: data?.user || null,
    };
};

// Allow server-side rendering
export const ssr = true;
