import { localStorageSharedStore, type SharedStore } from '$lib/client/svelte-shared-store';

export const dev_tooltips_enabled: SharedStore<boolean> = localStorageSharedStore<boolean>('dev_tooltips_enabled', false);
