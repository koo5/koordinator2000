import { error } from '@sveltejs/kit';
import { verify_magic_link_token } from '$lib/server/auth';
import { completeOAuthAndRedirect } from '$lib/server/oauth-flow';
import type { RequestHandler } from './$types';

/**
 * Consume a magic link: verify the token, then link/create the account with an
 * 'email' verification spoke (login_name = the email) and sign the user in.
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
    const token = url.searchParams.get('token');
    if (!token) throw error(400, 'Missing token');

    const result = await verify_magic_link_token(token);
    if (!result) throw error(400, 'This sign-in link is invalid or has expired.');

    return completeOAuthAndRedirect(cookies, 'email', result.email, result.email, result.linkAccountId);
};
