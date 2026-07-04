import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }: { data: any }) => {
    // Pass server layout data through (auth/session + resolved locale)
    return {
        session: data?.session || {},
        user: data?.user || null,
        locale: data?.locale || 'en',
    };
};


export const prerender = import.meta.env.VITE_TAURI ? true : false;
export const ssr = import.meta.env.VITE_TAURI ? false : true;

console.log('Layout prerender:', prerender);
console.log('Layout ssr:', ssr);
