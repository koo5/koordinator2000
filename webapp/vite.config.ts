import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { Plugin, UserConfig, Logger, ServerOptions } from 'vite';

// Custom logger interface
interface CustomLogger extends Logger {
	warn: (msg: string | Error, options?: any) => void;
}

// Custom server config
interface CustomServerConfig {
	config: {
		logger: CustomLogger;
		[key: string]: any;
	};
	[key: string]: any;
}

// Custom plugin to handle sourcemap warnings
const disableSourcemapWarningsPlugin: Plugin = {
	name: 'disable-sourcemap-warnings',
	enforce: 'pre',
	configureServer(server: CustomServerConfig) {
		// Override the warn method to filter out sourcemap warnings
		const originalWarn = server.config.logger.warn;
		server.config.logger.warn = (msg: string | Error, options?: any) => {
			// Skip sourcemap warnings for node_modules
			if (typeof msg === 'string' && 
				(msg.includes('Sourcemap') && msg.includes('node_modules') && msg.includes('missing source files'))) {
				return;
			}
			originalWarn(msg, options);
		};
	}
};

// Create a type-safe configuration
const config: UserConfig = {
	plugins: [
		sveltekit(),
		disableSourcemapWarningsPlugin
	],

	clearScreen: false,

	// Add externalization warnings to help debug
	build: {
		rollupOptions: {
			// External packages that should not be bundled
			external: []
		}
	},
	
	// Development server configuration
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['..']
		},
		// Use the host option for allowed hosts - correct in Vite 4+
		host: true, // This replaces allowedHosts: true,
		// Disable sourcemap validation warnings
		sourcemapIgnoreList: (path: string) => path.includes('node_modules')
	},
	
	// Fix SSR issues with browser-only modules
	ssr: {
		// List of packages that should be bundled for SSR
		noExternal: [],
		
		// Browser-only modules that should be treated as external during SSR
		external: [
			'@firebase/app',
			'firebase/database',
			'firebase',
			'codemirror',
			'remarkable',
			'path',
			'fs',
			'url',
			'source-map-js'
		]
	},
	
	// Resolve aliases for Node.js modules in browser
	resolve: {
		alias: {
			'path': 'path-browserify',
			'fs': './src/lib/empty-module.js',
			'url': 'url-polyfill',
			'source-map-js': './src/lib/empty-module.js'
		}
	}
};

export default defineConfig(config);