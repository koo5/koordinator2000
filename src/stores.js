//import { writable } from 'svelte/store';
import { writable as localStorageStoreWritable } from './localStorageStore'

export const request_queue_store = localStorageStoreWritable("request_queue", []);
