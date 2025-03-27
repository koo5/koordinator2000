import { json } from '@sveltejs/kit';
import { free_user_id } from '$lib/server/auth';
import moment from 'moment';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    console.log('/get_free_user_id');
    
    // Check if we have email data in the request
    let email = null;
    try {
        const data = await request.json();
        email = data.email;
    } catch (e) {
        // No JSON body or invalid JSON, continue without email
    }
    
    const result = await free_user_id(email);
    console.log(moment().format());
    console.log();
    
    return json(result);
}
