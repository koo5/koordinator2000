import { localStorageSharedStore, type SharedStore } from './svelte-shared-store.ts';

export const dev_tooltips_enabled: SharedStore<boolean> = localStorageSharedStore<boolean>('dev_tooltips_enabled', false);
