/*
https://gist.github.com/bdougherty/281593f0df6dad595fd56af9721e743d
no license!
*/

import { writable, get, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

interface StorageEvent {
  key: string | null;
  newValue: string | null;
}

export function localStorageSharedStore<T>(name_postfix: string, default_: T): Writable<T> {
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
    let result = default_;
    try {
      if (item !== 'undefined' && item) {
        result = JSON.parse(item);
      }
      if (!result || (result as any).id === undefined) {
        result = default_;
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
    
    function handleStorageEvent({ key, newValue }: StorageEvent): void {
      if (key !== name || !newValue) {
        return;
      }
      set(JSON.parse(newValue));
    }

    set(getStorage());
    window.addEventListener('storage', handleStorageEvent as EventListener);
    return () => window.removeEventListener('storage', handleStorageEvent as EventListener);
  }
  
  // Create a new writable with the start function for browser environment
  const browserStore = writable<T>(default_, start);
  
  return {
    subscribe: browserStore.subscribe,
    set(value: T): void {
      setStorage(value);
      browserStore.set(value);
    },
    update(fn: (value: T) => T): void {
      const value = fn(get({ subscribe: browserStore.subscribe }));
      setStorage(value);
      browserStore.set(value);
    }
  };
}