import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }: { data: any }) => {
    // Pass session data from parent layout directly (enables passing auth data)
    return {
        session: data?.session || {},
        user: data?.user || null,
    };
};


export const prerender = import.meta.env.VITE_TAURI ? true : false;
export const ssr = import.meta.env.VITE_TAURI ? false : true;

console.log('Layout prerender:', prerender);
console.log('Layout ssr:', ssr);
