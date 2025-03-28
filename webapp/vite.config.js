import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],

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
		allowedHosts: true
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
	}
});
