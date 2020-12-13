import {localStorageSharedStore} from './svelte-shared-store';

export const ui_mode = localStorageSharedStore('ui_mode', 'introductory');
