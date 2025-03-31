import { invoke } from '@tauri-apps/api/core';
import * as app from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';
import { readable } from 'svelte/store';

declare global {
    interface Window {
        __TAURI__: typeof app;
    }
}

let platformName = 'browser';
if (typeof window !== 'undefined') {
    if (Object.prototype.hasOwnProperty.call(window, '__TAURI__') && window.__TAURI_OS_PLUGIN_INTERNALS__) {
        platformName = platform();
    }
}

export const IS_TAURI = typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, '__TAURI__');
export const BROWSER = !IS_TAURI;
export const IS_TAURI_MOBILE = IS_TAURI && (platformName === 'android' || platformName === 'ios');

export const log = {
    debug: (...args: any[]) => {
        console.log(...args);
        if (window.__TAURI__) invoke('log', { message: formatNoColor(args) });
    },
};

function formatNoColor(args) {
    let msg = '';
    const inspected_nocolor = args.map(o => (typeof o === 'string' ? o : JSON.stringify(o, null, 2)));
    for (const v of inspected_nocolor) msg += v + ' ';
    return msg;
}

export const mobile: Readable<boolean> = readable(false, set => {
    if (typeof window !== 'undefined') {
        const check = () => set(window.innerWidth < 768);
        window.addEventListener('resize', check);
        check();
        return () => window.removeEventListener('resize', check);
    }
});
