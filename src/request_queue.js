import {get} from 'svelte/store'

import { request_queue_store } from "./stores"

import * as api from './api.js';
//import api from 'api'

export const request_queue = {

    put(x) {
        var queue = get(request_queue_store)
        queue.push(x);
        request_queue_store.set(queue)
    }

    //     queue.shift();
}

/*
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}
*/
// or: https://stackoverflow.com/questions/23677373/can-localstorage-slow-down-my-website-when-used-frequently
// https://stackoverflow.com/questions/21986979/is-an-unload-event-handler-guaranteed-to-finish-execution-before-the-loading-of
// https://stackoverflow.com/questions/41909365/what-are-the-limitation-using-before-unload-event
