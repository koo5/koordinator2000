/*
https://gist.github.com/bdougherty/281593f0df6dad595fd56af9721e743d
no license!
 */

import { writable, get } from 'svelte/store';

export function localStorageSharedStore(name_postfix, default_) {
	const name = `svelte-shared-store:${name_postfix}`;
	
	// Create the base writable store with default value
	const { subscribe, set, update: originalUpdate } = writable(default_);
	
	// Only use localStorage in browser environment
	if (typeof window === 'undefined') {
		// Return a simplified version for server-side rendering
		return {
			subscribe,
			set,
			update: originalUpdate
		};
	}
	
	// Browser-only functions
	function setStorage(value) {
		let str = JSON.stringify(value);
		window.localStorage.setItem(name, str);
	}

	function getStorage() {
		let item = window.localStorage.getItem(name);
		let result = default_;
		try {
			if (item != 'undefined' && item) {
				result = JSON.parse(item);
			}
			if (!result || !result.id) {
				result = default_;
			}
		} catch (e) {
			console.log('trying to parse: "' + item + '"');
			console.log(e);
		}
		return result;
	}

	// Initialize from localStorage and set up event listener
	function start() {
		function handleStorageEvent({ key, newValue }) {
			if (key !== name) {
				return;
			}
			set(JSON.parse(newValue));
		}

		set(getStorage());
		window.addEventListener('storage', handleStorageEvent);
		return () => window.removeEventListener('storage', handleStorageEvent);
	}
	
	// Create a new writable with the start function for browser environment
	const browserStore = writable(default_, start);
	
	return {
		subscribe: browserStore.subscribe,
		set(value) {
			setStorage(value);
			browserStore.set(value);
		},
		update(fn) {
			const value = fn(get({ subscribe: browserStore.subscribe }));
			setStorage(value);
			browserStore.set(value);
		}
	};
}
