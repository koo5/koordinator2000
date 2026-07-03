/**
 * Email sending. No transport is wired yet, so this logs the link server-side;
 * callers surface it directly in dev (see /auth/email/request). To enable real
 * email, drop an SMTP/provider transport in here and keep the signature.
 */
export async function send_magic_link_email(email: string, link: string): Promise<void> {
    console.log(`[magic-link] would email ${email}: ${link}`);
    // TODO: integrate an email transport (SMTP via nodemailer, or a provider API).
}
