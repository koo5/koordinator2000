import { writable, get, type Writable } from 'svelte/store';

export function localStorageSharedStore<T>(name: string, default_: T): Writable<T> {
    function setStorage(value: T): void {
        const str = JSON.stringify(value);
        //console.log('SAVE', name, str);
        window.localStorage.setItem(name, str);
    }

    function getStorage(): T {
        const item = window.localStorage.getItem(name);
        let result: T = default_;
        try {
            //console.log('LOAD', name, item);
            if (item !== null) {
                result = JSON.parse(item) as T;
            }
        } catch (e) {
            console.error('trying to parse: "' + item + '"');
            console.error(e);
        }
        return result;
    }

    function start(): () => void {
        function handleStorageEvent({ key, newValue }: StorageEvent): void {
            if (key !== name) {
                return;
            }
            set(JSON.parse(newValue!));
        }

        set(getStorage());
        window.addEventListener('storage', handleStorageEvent);

        return () => window.removeEventListener('storage', handleStorageEvent);
    }

    const { subscribe, set, update } = writable<T>(default_, start);

    let r = {
        subscribe,
        set(value: T): void {
            setStorage(value);
            set(value);
        },
        update(fn: (value: T) => T): void {
            const value2 = fn(get(r));
            setStorage(value2);
            set(value2);
        },
    };
    return r;
}

export function localStorageReadOnceSharedStore<T>(name: string, default_: T): Writable<T> {
    function setStorage(value: T): void {
        const str = JSON.stringify(value);
        //console.log('SAVE', name, str);
        window.localStorage.setItem(name, str);
    }

    function getStorage(): T {
        const item = window.localStorage.getItem(name);
        let result: T = default_;
        try {
            if (item !== 'undefined' && item) result = JSON.parse(item) as T;
            if (!result) result = default_;
        } catch (e) {
            console.log('trying to parse: "' + item + '"');
            console.log(e);
        }
        return result;
    }

    function start(): void {
        set(getStorage());
    }

    const { subscribe, set, update } = writable<T>(default_, start);

    let r = {
        subscribe,
        set(value: T): void {
            setStorage(value);
            set(value);
        },
        update(fn: (value: T) => T): void {
            const value2 = fn(get(r));
            setStorage(value2);
            set(value2);
        },
    };
    return r;
}
