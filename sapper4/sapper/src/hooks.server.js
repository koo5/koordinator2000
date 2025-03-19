import moment from 'moment';
import { minify } from 'html-minifier';
import { building } from '$app/environment';
import { free_user_id, process_event } from '$lib/auth';
import { env } from '$lib/env';
import * as config_file from './config.js';

const config = config_file.config;

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
export const handle = async ({ event, resolve }) => {
	// Log timestamp for each request
	console.log(moment().format());
	
	// Add session data to locals
	event.locals.session = {
		PUBLIC_URL: env.PUBLIC_URL,
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT || env.PUBLIC_GRAPHQL_ENDPOINT,
		PUBLIC_GRAPHQL_HEADERS: config.PUBLIC_GRAPHQL_HEADERS,
		BASE_URL: env.PUBLIC_BASE_URL
	};
	
	return await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (done && building) {
				return minify(html, minification_options);
			}
			return html;
		}
	});
};
