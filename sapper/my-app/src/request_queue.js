import {get} from 'svelte/store'

import { request_queue_store } from "./stores"

import { send } from './api'

export const request_queue = {

    try_to_process_request_from_queue() {
        var queue = get(request_queue_store);
        if (queue.length > 0)
            this.try_request(queue[0])
    },

    try_request(request) {
        send({method:request.method, path:request.path, data:request.data, token:null
        }).then(
            (result) => {
                var queue = get(request_queue_store);
                queue.splice(queue.indexOf(request), 1);
                request_queue_store.set(queue);
                this.try_to_process_request_from_queue();
            }).catch((e) => {
                console.log('error', e);
        })
    },

    put(x) {
        var queue = get(request_queue_store);
        queue.push(x);
        request_queue_store.set(queue);
        this.try_to_process_request_from_queue();
    }
}

// or: https://stackoverflow.com/questions/23677373/can-localstorage-slow-down-my-website-when-used-frequently
// https://stackoverflow.com/questions/21986979/is-an-unload-event-handler-guaranteed-to-finish-execution-before-the-loading-of
// https://stackoverflow.com/questions/41909365/what-are-the-limitation-using-before-unload-event
/*
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}
Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}
*/
