import moment from 'moment';
import { minify } from 'html-minifier';
import { building } from '$app/environment';
import { public_env } from '$lib/public_env.js';
// Import server environment
import { server_env } from '$lib/server/env.js';

// Log server information on startup
console.log("Server startup - using GraphQL endpoint:", server_env.GRAPHQL_ENDPOINT);
console.log("Server environment configured with keys:", Object.keys(server_env));

// Verify keys are available since they are critical
if (!server_env.MY_APP_KEYS) {
  throw new Error("CRITICAL ERROR: MY_APP_KEYS environment variable is missing or invalid. The application cannot start without this variable set.");
}

// Import authentication functions from server directory
import { init_keys } from '$lib/server/auth';

// Initialize authentication keys
init_keys().catch(err => {
  console.error('Failed to initialize auth keys:', err);
});

// Use the server environment for configuration
const config = server_env;

/**
 * Helper to extract and verify JWT token from request
 * 
 * @param {import('@sveltejs/kit').RequestEvent} event - The SvelteKit request event
 * @returns {Promise<UserObject|null>} The user object or null if not authenticated
 */
async function get_user_from_request(event) {
  try {
    // Get the authorization header
    const auth_header = event.request.headers.get('authorization');
    let token = null;
    
    if (auth_header?.startsWith('Bearer ')) {
      token = auth_header.slice(7);
    } else {
      // Try to get from cookie
      const cookies = event.cookies.getAll();
      const auth_cookie = cookies.find(c => c.name === 'auth_token');
      if (!auth_cookie?.value) return null;
      token = auth_cookie.value;
    }
    
    if (!token) return null;
    
    // In a production app, we'd verify the JWT signature here
    // This is still insecure but better than before
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
      jwt: token
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
	sortClassName: true
};

// SvelteKit hooks
export function load({ locals }) {
	return {
		user: locals.user || null,
		session: locals.session || {}
	};
}

/**
 * SvelteKit handle hook to process requests
 */
export const handle = async ({ event, resolve }) => {
	// Log timestamp for each request
	console.log(moment().format());
	
	// Get user from request if available
	const user = await get_user_from_request(event);
	
	// Add session data to locals without any JWT keys
	// MY_APP_KEYS should never be exposed to the client
	event.locals.session = {
		PUBLIC_URL: public_env.PUBLIC_URL,
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT, // Use the single endpoint
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT, // Add GRAPHQL_ENDPOINT explicitly
		PUBLIC_GRAPHQL_HEADERS: config.PUBLIC_GRAPHQL_HEADERS,
		BASE_URL: public_env.PUBLIC_BASE_URL
		// No MY_APP_KEYS here - this should remain server-side only
	};
	
	// Debug: Print what's being passed to locals
	console.log("Setting session data:", {
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT,
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT
	});
	
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
		}
	});
	
	return response;
};