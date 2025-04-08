import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    console.log('Test endpoint hit');
    return json({ status: 'ok', message: 'Keycloak test endpoint working' });
};