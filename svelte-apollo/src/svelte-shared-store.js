/*
https://gist.github.com/bdougherty/281593f0df6dad595fd56af9721e743d
no license!
 */

import { writable, get } from 'svelte/store';


function makeLocalStorageSharedStore(name) {

	function setStorage(value, default_ = undefined) {
		let str = JSON.stringify(value);
		console.log(str);
		window.localStorage.setItem(name, str);
	}

	function getStorage() {
		let item = window.localStorage.getItem(name);
		console.log(item);
		try
		{
			if (item == 'undefined') // only in JS...
				return default_;
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
		//console.log('111');
		window.addEventListener('storage', handleStorageEvent);

		return () => window.removeEventListener('storage', handleStorageEvent);
	});

	return {
		subscribe,
		set(value) {
			//console.log(value);
			setStorage(value);
			set(value);
		},
		update(callback) {
			//console.log(callback);
			update(callback);
		}
	};
}

export const localStorageSharedStore = (name) => makeLocalStorageSharedStore(`svelte-shared-store:${name}`);
