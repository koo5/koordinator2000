import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { sign_magic_link_token, verify_user_jwt } from '$lib/server/auth';
import { send_magic_link_email } from '$lib/server/email';
import { server_env } from '$lib/server/env';
import type { RequestHandler } from './$types';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/**
 * Request a passwordless sign-in / verification link. Signs a stateless
 * magic-link token, "emails" it (logged for now), and — anonymous-first — binds
 * it to the current account if a valid session is present. In dev the link is
 * returned in the response so it's usable without an email provider.
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
    let body: any;
    try {
        body = await request.json();
    } catch {
        body = {};
    }
    const email = (body?.email ?? '').trim();
    if (!EMAIL_RE.test(email)) {
        return json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    let linkAccountId: number | undefined;
    const jwt = cookies.get('Authorization');
    if (jwt) {
        const id = await verify_user_jwt(jwt);
        if (id) linkAccountId = id;
    }

    const token = await sign_magic_link_token(email, linkAccountId);
    const link = `${server_env.PUBLIC_URL}/auth/email/verify?token=${encodeURIComponent(token)}`;

    try {
        await send_magic_link_email(email, link);
    } catch (e) {
        console.error('magic-link email send failed:', e);
        if (!dev) {
            return json({ error: 'Could not send the email. Please try again later.' }, { status: 502 });
        }
        // In dev the link is returned below anyway, so a send failure is not fatal.
    }

    // Dev convenience only — NEVER in prod (returning the link would let anyone
    // who can POST an email address obtain a sign-in link for it).
    return json({ ok: true, ...(dev ? { devLink: link } : {}) });
};
