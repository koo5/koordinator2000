import { writable, get, type Writable } from 'svelte/store';
import { browser } from '$app/environment';

export function localStorageSharedStore<T>(name: string, default_: T): Writable<T> {
    const initialValue = browser ? getStorage() : default_;
    const { subscribe, set, update } = writable<T>(initialValue, set => {
        // start function: only run browser-specific logic if in the browser
        if (browser) {
            // Set initial value from storage on client-side hydration
            set(getStorage());

            const handleStorageEvent = ({ key, newValue }: StorageEvent): void => {
                if (key === name && newValue !== null) {
                    try {
                        set(JSON.parse(newValue));
                    } catch (e) {
                        console.error(`Error parsing storage event for key "${name}":`, e);
                    }
                }
            };

            window.addEventListener('storage', handleStorageEvent);
            return () => window.removeEventListener('storage', handleStorageEvent);
        }
        // No cleanup needed on the server
        return () => {};
    });

    function setStorage(value: T): void {
        if (browser) {
            try {
                const str = JSON.stringify(value);
                window.localStorage.setItem(name, str);
            } catch (e) {
                console.error(`Error setting localStorage for key "${name}":`, e);
            }
        }
    }

    function getStorage(): T {
        if (!browser) {
            return default_; // Return default value during SSR
        }
        const item = window.localStorage.getItem(name);
        let result: T = default_;
        if (item !== null) {
            try {
                result = JSON.parse(item) as T;
            } catch (e) {
                console.error(`Error parsing localStorage for key "${name}": "${item}"`, e);
                // Keep default value if parsing fails
            }
        }
        return result;
    }

    return {
        subscribe,
        set(value: T): void {
            setStorage(value); // Persist only in browser
            set(value); // Update store value everywhere
        },
        update(fn: (value: T) => T): void {
            update(currentValue => {
                const newValue = fn(currentValue);
                setStorage(newValue); // Persist only in browser
                return newValue; // Update store value everywhere
            });
        },
    };
}

export function localStorageReadOnceSharedStore<T>(name: string, default_: T): Writable<T> {
    const initialValue = browser ? getStorage() : default_;
    const { subscribe, set, update } = writable<T>(initialValue, set => {
        // start function: only run browser-specific logic if in the browser
        if (browser) {
            // Set initial value from storage on client-side hydration
            set(getStorage());
        }
        // No event listeners or cleanup needed for this store type
        return () => {};
    });

    function setStorage(value: T): void {
        if (browser) {
            try {
                const str = JSON.stringify(value);
                window.localStorage.setItem(name, str);
            } catch (e) {
                console.error(`Error setting localStorage for key "${name}":`, e);
            }
        }
    }

    function getStorage(): T {
        if (!browser) {
            return default_; // Return default value during SSR
        }
        const item = window.localStorage.getItem(name);
        let result: T = default_;
        // Check for 'undefined' string as well, potentially from older versions or manual edits
        if (item !== null && item !== 'undefined') {
            try {
                result = JSON.parse(item) as T;
                // Ensure result is not null/undefined after parsing, fall back to default if it is
                if (result == null) {
                    result = default_;
                }
            } catch (e) {
                console.error(`Error parsing localStorage for key "${name}": "${item}"`, e);
                // Keep default value if parsing fails
            }
        }
        return result;
    }

    return {
        subscribe,
        set(value: T): void {
            setStorage(value); // Persist only in browser
            set(value); // Update store value everywhere
        },
        update(fn: (value: T) => T): void {
            update(currentValue => {
                const newValue = fn(currentValue);
                setStorage(newValue); // Persist only in browser
                return newValue; // Update store value everywhere
            });
        },
    };
}
