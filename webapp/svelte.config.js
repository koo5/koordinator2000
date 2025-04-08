import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Configure the preprocessor for TypeScript support
    preprocess: vitePreprocess({
        typescript: {
            // Force TypeScript to use the project's tsconfig.json
            tsconfigFile: './tsconfig.json',
            // Handle TypeScript code in Svelte components
            handleMixedImports: true
        }
    }),

    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        adapter: adapter({
            // default options are shown
            out: 'build',
            precompress: false,
            envPrefix: ''
        }),
        alias: {
            '$lib': './src/lib',
            'src': './src'
        }
    }
};

export default config;