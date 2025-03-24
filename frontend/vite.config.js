import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	
	// Configure Node.js built-in replacements
	resolve: {
		alias: {
			// SvelteKit provides its own fetch polyfill
			'node-fetch': 'isomorphic-fetch'
		}
	},
	
	// Handle Global object for browser compatibility
	define: {
		// Define environment variables
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
	},
	
	// Properly handle Node.js built-ins for browser
	optimizeDeps: {
		esbuildOptions: {
			// Empty define to avoid window references during SSR
		}
	},
	
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
		}
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
			'remarkable'
		]
	}
});
