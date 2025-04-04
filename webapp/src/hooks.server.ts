import moment from 'moment';
import { minify } from 'html-minifier';
import { building } from '$app/environment';
import { server_env } from '$lib/server/env.ts';
import type { Handle, RequestEvent } from '@sveltejs/kit';
// Import both authentication systems for transition period
import { init_keys } from '$lib/server/auth.ts';


// Log server information on startup
console.log('Server startup - using GraphQL endpoint:', server_env.GRAPHQL_ENDPOINT);
console.log(
    'Server environment:',
    Object.getOwnPropertyNames(server_env).map(key => `${key}: ${JSON.stringify(server_env[key as keyof typeof server_env])}`)
);

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
    try {
        // Get the authorization header
        const auth_header = event.request.headers.get('Authorization');
        console.log('auth header:', auth_header);

        let token: string | null = null;

        if (auth_header?.startsWith('Bearer ')) {
            token = auth_header.slice(7);
        } else {
            // Try to get from cookie
            const cookies = event.cookies.getAll();
            console.log('cookies:', cookies);

            const auth_cookie = cookies.find(c => c.name === 'Authorization');
            if (!auth_cookie?.value) return null;
            token = auth_cookie.value;
        }

        if (!token) return null;

        // In a production app, we'd verify the JWT signature here
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid JWT format');
            return null;
        }

        // Decode the payload (middle part)
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        // Basic validation
        const current_time = Math.floor(Date.now() / 1000);

        // Check if token is expired
        if (payload.exp && payload.exp < current_time) {
            console.error('Token expired');
            return null;
        }

        // Get user ID from token
        const user_id = payload['urn:id'];
        if (!user_id) {
            console.error('Token missing user ID');
            return null;
        }

        // In a real app, we'd fetch additional user data here
        return {
            id: user_id,
            jwt: token,
        };
    } catch (error) {
        console.error('Error parsing auth token:', error);
        return null;
    }
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
    // Log timestamp for each request
    console.log('server request at', moment().format('YYYY-MM-DD HH:mm:ss'), 'for', event.url.pathname);

    // Get user from request if available
    const user = await get_user_from_request(event);
    console.log('request user:', user);

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
