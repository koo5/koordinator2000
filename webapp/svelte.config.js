// The app has server routes (OAuth callbacks, account creation, magic-link,
// renew-jwt, delete-account) that need a running server — so a Node adapter,
// NOT adapter-static (which would 404 all of them in prod).
import adapter from '@sveltejs/adapter-node'

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

//const adapter = process.env.VITE_TAURI ? adapter_static : adapter_node;

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
