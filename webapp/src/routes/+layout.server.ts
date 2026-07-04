import type { LayoutServerLoad } from './$types';
import { server_env } from '$lib/server/env';

/**
 * Root server load: carries the request-scoped locale (resolved in
 * hooks.server.ts from the cookie override / Accept-Language) into layout data,
 * where +layout.svelte initializes the i18n store before first render.
 * Also provides the public session config (PUBLIC_URL etc.) the layout expects.
 */
export const load: LayoutServerLoad = ({ locals }) => {
    return {
        locale: locals.locale || 'en',
        user: locals.user,
        session: {
            PUBLIC_URL: server_env.PUBLIC_URL,
            GRAPHQL_ENDPOINT: server_env.GRAPHQL_ENDPOINT,
            BASE_URL: server_env.PUBLIC_BASE_URL,
        },
    };
};
