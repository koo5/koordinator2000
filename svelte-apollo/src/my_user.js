import { writable } from 'svelte/store';

export const my_user = writable({id:1,name:'',email:''});

export function impersonate(_id)
{
    my_user.set({id:_id} )
}

