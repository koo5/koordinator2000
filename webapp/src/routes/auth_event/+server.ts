import { json } from '@sveltejs/kit';
import { process_auth_event } from '$lib/server/auth.ts';
import type { RequestHandler } from './$types';
import moment from 'moment';

export const POST: RequestHandler = async ({ request }) => {
    const data = await request.json();
    let e = data.event;
    let rrr = await process_auth_event(e);
    console.log('response:', rrr);
    return json(rrr || {});
}