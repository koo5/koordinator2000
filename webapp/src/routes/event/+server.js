import { json } from '@sveltejs/kit';
import { process_auth_event } from '$lib/server/auth';
import moment from 'moment';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    const data = await request.json();
    let e = data.event;
    let rrr = await process_auth_event(e);
    console.log('response:', rrr);
    return json(rrr || {});
}
