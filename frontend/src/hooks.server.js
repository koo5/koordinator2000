import moment from 'moment';
import { minify } from 'html-minifier';
import { building } from '$app/environment';
import { env } from '$lib/env';
import * as config_file from './config.js';

// Import auth functions but don't initialize keys immediately
import { free_user_id, process_event } from '$lib/auth';

const config = config_file.config;

// Helper to parse JWT token
async function getUserFromRequest(event) {
  try {
    // Get the authorization header
    const authHeader = event.request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      // Try to get from cookie
      const cookies = event.cookies.getAll();
      const authCookie = cookies.find(c => c.name === 'auth_token');
      if (!authCookie?.value) return null;
      
      // Verify and decode the token
      // This is a simplified example - in a real app, you'd verify the JWT
      return JSON.parse(Buffer.from(authCookie.value.split('.')[1], 'base64').toString());
    }
    
    const token = authHeader.slice(7);
    // Verify and decode the token
    // This is a simplified example - in a real app, you'd verify the JWT
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
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

export const handle = async ({ event, resolve }) => {
	// Log timestamp for each request
	console.log(moment().format());
	
	// Get user from request if available
	const user = await getUserFromRequest(event);
	
	// Add session data to locals
	event.locals.session = {
		PUBLIC_URL: env.PUBLIC_URL,
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT || env.PUBLIC_GRAPHQL_ENDPOINT,
		PUBLIC_GRAPHQL_HEADERS: config.PUBLIC_GRAPHQL_HEADERS,
		BASE_URL: env.PUBLIC_BASE_URL
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
