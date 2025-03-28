import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		// Custom plugin to disable sourcemap validation warnings
		{
			name: 'disable-sourcemap-warnings',
			enforce: 'pre',
			configureServer(server) {
				// Override the warn method to filter out sourcemap warnings
				const originalWarn = server.config.logger.warn;
				server.config.logger.warn = (msg, options) => {
					// Skip sourcemap warnings for node_modules
					if (typeof msg === 'string' && 
						(msg.includes('Sourcemap') && msg.includes('node_modules') && msg.includes('missing source files'))) {
						return;
					}
					originalWarn(msg, options);
				};
			}
		}
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
		allowedHosts: true,
		// Disable sourcemap validation warnings
		sourcemapIgnoreList: (path) => path.includes('node_modules')
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
	
	// Include @urql/svelte in dependency optimization
	optimizeDeps: {
		include: ['@urql/svelte']
	}
});
