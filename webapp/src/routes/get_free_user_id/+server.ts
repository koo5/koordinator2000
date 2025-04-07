import { json } from '@sveltejs/kit';
import { free_user_id } from '$lib/server/auth';
import moment from 'moment';
import type { RequestHandler } from './$types';

interface RequestBody {
    email?: string;
}

export const POST: RequestHandler = async ({ request }) => {
    console.log('/get_free_user_id');

    // Check if we have email data in the request
    let email: string | null = null;
    try {
        const data = await request.json() as RequestBody;
        email = data.email || null;
    } catch (e) {
        // No JSON body or invalid JSON, continue without email
    }

    const result = await free_user_id(email);
    console.log(moment().format());
    console.log();

    return json(result);
};
