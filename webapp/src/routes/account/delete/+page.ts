import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { my_user } from '$lib/client/my_user';
import { get } from 'svelte/store';

export function load() {
    if (browser) {
        // Ensure user is logged in
        const user = get(my_user);
        if (!user || !user.id) {
            goto('/');
            return { user: null };
        }
        
        return {
            user
        };
    }
    
    return {};
}