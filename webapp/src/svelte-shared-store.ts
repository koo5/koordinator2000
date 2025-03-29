/*
https://gist.github.com/bdougherty/281593f0df6dad595fd56af9721e743d
no license!
 */

import { writable, get, type Writable, type Updater, type Subscriber, type Unsubscriber } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Storage event handler interface
 */
interface StorageEventValue {
  key: string | null;
  newValue: string | null;
}

/**
 * Shared store interface that extends Writable
 */
export interface SharedStore<T> extends Writable<T> {
  subscribe: (run: Subscriber<T>) => Unsubscriber;
  set: (value: T) => void;
  update: (updater: Updater<T>) => void;
}

/**
 * Creates a writable store that syncs with localStorage across tabs
 * @param name_postfix - Unique identifier for the store
 * @param default_ - Default value
 * @returns A writable store that syncs with localStorage
 */
export function localStorageSharedStore<T>(name_postfix: string, default_: T): SharedStore<T> {
	const name = `svelte-shared-store:${name_postfix}`;
	
	// Create the base writable store with default value
	const { subscribe, set, update: originalUpdate } = writable<T>(default_);

	// Only use localStorage in browser environment
	if (!browser) {
		// Return a simplified version for server-side rendering
		return {
			subscribe,
			set,
			update: originalUpdate
		};
	}
	
	// Browser-only functions
	function setStorage(value: T): void {
		if (!browser) return;
		let str = JSON.stringify(value);
		localStorage.setItem(name, str);
	}

	function getStorage(): T {
		if (!browser) return default_;
		let item = localStorage.getItem(name);
		let result: T = default_;
		try {
			if (item !== 'undefined' && item) {
				result = JSON.parse(item) as T;
			}
			// This check is specific to stores with ID field - might need adjustment
			if (typeof result === 'object' && result !== null && 'id' in result) {
				const resultWithId = result as unknown as { id: unknown };
				if (!resultWithId.id) {
					result = default_;
				}
			}
		} catch (e) {
			console.log('trying to parse: "' + item + '"');
			console.log(e);
		}
		return result;
	}

	// Initialize from localStorage and set up event listener
	function start(): () => void {
		if (!browser) return () => {};
		
		function handleStorageEvent({ key, newValue }: StorageEventValue): void {
			if (key !== name || newValue === null) {
				return;
			}
			set(JSON.parse(newValue) as T);
		}

		set(getStorage());
		addEventListener('storage', handleStorageEvent as EventListener);
		return () => removeEventListener('storage', handleStorageEvent as EventListener);
	}
	
	// Create a new writable with the start function for browser environment
	const browserStore = writable<T>(default_, start);
	
	return {
		subscribe: browserStore.subscribe,
		set(value: T): void {
			setStorage(value);
			browserStore.set(value);
		},
		update(fn: Updater<T>): void {
			const value = fn(get({ subscribe: browserStore.subscribe }));
			setStorage(value);
			browserStore.set(value);
		}
	};
}
