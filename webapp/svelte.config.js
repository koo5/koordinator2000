import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [
    vitePreprocess(),
    preprocess({
      typescript: {
        tsconfigFile: './tsconfig.json'
      }
    })
  ],

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
      '$lib/*': './src/lib/*',
      'src': './src',
      'src/*': './src/*'
    }
  },

  // Svelte 5 specific options
  compilerOptions: {
    // Don't globally enable runes mode to allow external libraries to work
    // Instead we'll opt-in per file with <script lang="ts">
    runes: false,
  }
};

export default config;
