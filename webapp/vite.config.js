import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        dev: {
          // Enable component checks during development
          check: { enable: true }
        }
      }
    })
  ],
  
  // Configure Node.js built-in replacements
  resolve: {
    alias: {
      // SvelteKit provides its own fetch polyfill
      'node-fetch': 'isomorphic-fetch',
      
      // Provide browser versions of Node.js built-ins
      path: 'path-browserify',
      url: 'url-polyfill',
      fs: './src/lib/empty-polyfill.js',
      'source-map-js': './src/lib/empty-module.js'
    }
  },

  // Properly handle Node.js built-ins for browser
  optimizeDeps: {
    esbuildOptions: {
      // Define empty modules for Node.js built-ins
      define: {
        global: 'globalThis'
      }
    },
    include: [
      // Ensure these are pre-bundled
      'path-browserify',
      'url-polyfill'
    ]
  },
  
  // Build configuration for Vite 6
  build: {
    // Ensure build works with older browsers if needed
    target: 'es2020',
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
      'remarkable',
      'path',
      'fs',
      'url',
      'source-map-js'
    ]
  }
});