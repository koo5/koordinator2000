import { json } from '@sveltejs/kit';
import { free_user_id } from '$lib/auth';
import moment from 'moment';

/** @type {import('./$types').RequestHandler} */
export async function POST() {
    console.log('/get_free_user_id');
    const result = await free_user_id();
    console.log(moment().format());
    console.log();
    
    return json(result);
}
