/**
 * Email sending via a hosted email API — no self-hosted SMTP.
 *
 * Provider: Resend (https://resend.com) — free tier (~100/day), a single POST,
 * zero dependencies. Alternative with a bigger free tier if ever needed:
 * Brevo (~300/day, same shape of API; swap the fetch below).
 *
 * Config (server-side env):
 *   RESEND_API_KEY — from the Resend dashboard. Unset => emails are logged only
 *                    (dev mode; /auth/email/request returns the link directly).
 *   EMAIL_FROM     — verified sender, e.g. "Koordinator <auth@your.domain>".
 *                    Resend's "onboarding@resend.dev" works for testing.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Koordinator <onboarding@resend.dev>';

export function email_configured(): boolean {
    return !!RESEND_API_KEY;
}

export async function send_magic_link_email(email: string, link: string): Promise<void> {
    if (!RESEND_API_KEY) {
        console.log(`[magic-link] email not configured; would email ${email}: ${link}`);
        return;
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: EMAIL_FROM,
            to: [email],
            subject: 'Your Koordinator sign-in link',
            html:
                `<p>Click to sign in to <b>Koordinator</b>:</p>` +
                `<p><a href="${link}">Sign in</a></p>` +
                `<p>This link is valid for 15 minutes. If you didn't request it, ignore this email.</p>`,
            text: `Sign in to Koordinator: ${link}\n\nValid for 15 minutes. If you didn't request it, ignore this email.`,
        }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Email send failed (${res.status}): ${body.slice(0, 300)}`);
    }
}
