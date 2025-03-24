import { json } from '@sveltejs/kit';
import { process_event } from '$lib/server/auth';
import moment from 'moment';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    const data = await request.json();
    let e = data.event;
    let rrr = await process_event(e);
    console.log('/event response:');
    console.log(rrr);
    console.log(moment().format());
    console.log();
    
    return json(rrr || {});
}
