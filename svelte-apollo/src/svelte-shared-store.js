/*
https://gist.github.com/bdougherty/281593f0df6dad595fd56af9721e743d
no license!
 */

import { writable, get } from 'svelte/store';


function makeLocalStorageSharedStore(name) {

	function setStorage(value) {
		window.localStorage.setItem(name, JSON.stringify(value));
	}

	function getStorage() {
		let item = window.localStorage.getItem(name);
		try
		{
			if (item == 'undefined') // only in JS...
				return undefined;
			return JSON.parse(item);
		}
		catch (e)
		{
			console.log('trying to parse: "' + item + '"');
			console.log(e);
		}
	}

	const { subscribe, set, update } = writable(null, () => {
		function handleStorageEvent({ key, newValue }) {
			if (key !== name) {
				return;
			}

			set(JSON.parse(newValue));
		}

		set(getStorage());
		window.addEventListener('storage', handleStorageEvent);

		return () => window.removeEventListener('storage', handleStorageEvent);
	});

	return {
		subscribe,
		set(value) {
			setStorage(value);
			set(value);
		},
		update(callback) {
			const value = update(callback);
			setStorage(value);
		}
	};
}

export const localStorageSharedStore = (name) => makeLocalStorageSharedStore(`svelte-shared-store:${name}`);
