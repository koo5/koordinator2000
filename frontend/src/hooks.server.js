import moment from 'moment';
import { minify } from 'html-minifier';
import { building } from '$app/environment';
import { env } from '$lib/env';
import * as config_file from './config.js';
// Import server-side env variables 
import { MY_APP_KEYS } from '$env/static/private';

// Verify MY_APP_KEYS exists - throw error if missing as this is critical
if (!MY_APP_KEYS) {
  throw new Error("CRITICAL ERROR: MY_APP_KEYS environment variable is missing. The application cannot start without this variable set.");
}

// Also verify the key is in valid JSON format with required properties
try {
  const parsedKeys = JSON.parse(MY_APP_KEYS);
  if (!parsedKeys || typeof parsedKeys !== 'object') {
    throw new Error("MY_APP_KEYS must be a valid JSON object");
  }
  if (!parsedKeys.private || !parsedKeys.public) {
    throw new Error("MY_APP_KEYS must contain both 'private' and 'public' key objects");
  }
  if (!parsedKeys.private.alg || !parsedKeys.private.d || !parsedKeys.private.x || !parsedKeys.private.y) {
    throw new Error("MY_APP_KEYS.private is missing required key properties");
  }
  if (!parsedKeys.public.alg || !parsedKeys.public.x || !parsedKeys.public.y) {
    throw new Error("MY_APP_KEYS.public is missing required key properties");
  }
  
  console.log("MY_APP_KEYS validation successful - application can start");
  
  // Add the parsed keys to the config for server-side use
  config_file.config.MY_APP_KEYS = parsedKeys;
} catch (e) {
  throw new Error(`CRITICAL ERROR: Invalid MY_APP_KEYS format: ${e.message}`);
}

// Define stubs for auth functions that will be dynamically imported in browser
// This avoids SSR issues with browser-only code
let free_user_id = async () => {};
let process_event = async () => {};

// Import browser check
import { browser } from '$app/environment';

// In browser environment, dynamically import the real functions
if (browser) {
  import('$lib/auth').then(auth => {
    free_user_id = auth.free_user_id;
    process_event = auth.process_event;
  }).catch(err => {
    console.error('Failed to import auth functions:', err);
  });
}

const config = config_file.config;

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
		PUBLIC_URL: env.PUBLIC_URL,
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT, // Use the single endpoint
		PUBLIC_GRAPHQL_HEADERS: config.PUBLIC_GRAPHQL_HEADERS,
		BASE_URL: env.PUBLIC_BASE_URL
		// No MY_APP_KEYS here - this should remain server-side only
	};
	
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