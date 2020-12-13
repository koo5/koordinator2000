import {localStorageSharedStore} from './svelte-shared-store';

export const my_user = localStorageSharedStore('my_user');

export function impersonate(_id)
{
    my_user.set({id:_id} )
}
