import moment from 'moment';
import { minify } from 'html-minifier';
import { building } from '$app/environment';
import { server_env } from '$lib/server/env.ts';
import type { Handle, RequestEvent } from '@sveltejs/kit';
// Import both authentication systems for transition period
import { init_keys, verify_user_jwt } from '$lib/server/auth.ts';


// Log server information on startup. Do NOT dump server_env — it holds secrets
// (MY_APP_KEYS private key, admin secret, OAuth client secrets).
console.log('Server startup - using GraphQL endpoint:', server_env.GRAPHQL_ENDPOINT);

Promise.all([
    init_keys().catch(err => {
        console.error('Failed to initialize auth keys:', err);
    }),
]);

/**
 * Helper to extract and verify JWT token from request
 *
 * @param event - The SvelteKit request event
 * @returns The user object or null if not authenticated
 */
async function get_user_from_request(event: RequestEvent): Promise<App.UserObject | null> {
    let token: string | null = null;

    const auth_header = event.request.headers.get('Authorization');
    if (auth_header?.startsWith('Bearer ')) {
        token = auth_header.slice(7);
    } else {
        token = event.cookies.get('Authorization') ?? null;
    }

    if (!token) return null;

    // VERIFY the signature (not just decode). locals.user gates /api/renew-jwt
    // (which mints a fresh real JWT) and /api/delete-account, so a forged
    // `urn:id` must never be trusted. verify_user_jwt checks signature, exp,
    // issuer and audience.
    const id = await verify_user_jwt(token);
    if (!id) return null;

    return { id, jwt: token };
}

// HTML minifier options
const minification_options = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    decodeEntities: true,
    html5: true,
    ignoreCustomComments: [/^#/],
    minifyCSS: true,
    minifyJS: false,
    removeAttributeQuotes: true,
    removeComments: false, // some hydration code needs comments, so leave them in
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
};

/**
 * SvelteKit load function for server routes
 */
export function load({ locals }: { locals: App.Locals }): { user: App.UserObject | null; session: Record<string, any> } {
    return {
        user: locals.user || null,
        session: locals.session || {},
    };
}

/**
 * SvelteKit handle hook to process requests
 */
export const handle: Handle = async ({ event, resolve }) => {
    // Log timestamp for each request (no token/user — those leak into logs)
    console.log('server request at', moment().format('YYYY-MM-DD HH:mm:ss'), 'for', event.url.pathname);

    // Get user from request if available (signature-verified)
    const user = await get_user_from_request(event);

    // Add user to locals if authenticated
    if (user) {
        event.locals.user = user;
    }

    const response = await resolve(event, {
        transformPageChunk: ({ html, done }) => {
            if (done && building) {
                return minify(html, minification_options);
            }
            return html;
        },
    });

    return response;
};
