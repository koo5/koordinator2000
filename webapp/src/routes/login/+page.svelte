<script lang="ts">
    import { get } from 'svelte/store';
    import { my_user } from '$lib/client/my_user';

    let email = '';
    let emailStatus = '';
    let devLink = '';

    /** Drop the current JWT into a short-lived cookie so the server can attach the
     * new verification to THIS (anonymous) account rather than making a fresh one. */
    function setLinkCookie(): void {
        const jwt = get(my_user)?.jwt;
        if (jwt) document.cookie = `Authorization=${jwt}; path=/; max-age=600; samesite=lax`;
    }

    function loginWith(provider: string): void {
        setLinkCookie();
        window.location.href = `/auth/${provider}/login`;
    }

    async function sendMagicLink(): Promise<void> {
        emailStatus = 'Sending…';
        devLink = '';
        setLinkCookie();
        const res = await fetch('/auth/email/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            emailStatus = 'Check your email for a sign-in link.';
            devLink = data.devLink || '';
        } else {
            emailStatus = data.error || 'Could not send the link.';
        }
    }
</script>

<div class="content_block">
    <h2>Sign in / verify your identity</h2>
    <p>
        Adding a verified identity attaches it to your account — it doesn't replace it. You can add
        more than one; each adds trust. If you're currently an anonymous user, your pledges carry over.
    </p>

    <div class="flex flex-col gap-2 max-w-xs">
        <button class="btn btn-primary" on:click={() => loginWith('github')}>Continue with GitHub</button>
        <button class="btn btn-primary" on:click={() => loginWith('google')}>Continue with Google</button>
    </div>

    <hr class="my-4" />

    <h3 class="text-lg font-semibold">Or use your email — no password</h3>
    <p>We'll send you a one-time sign-in link.</p>
    <form on:submit|preventDefault={sendMagicLink} class="flex flex-col gap-2 max-w-xs">
        <input class="input input-bordered" type="email" bind:value={email} placeholder="you@example.com" required />
        <button class="btn btn-secondary" type="submit">Send me a sign-in link</button>
    </form>

    {#if emailStatus}<p class="mt-2">{emailStatus}</p>{/if}
    {#if devLink}
        <p class="mt-1"><small>Dev link (email not configured): <a class="link" href={devLink}>{devLink}</a></small></p>
    {/if}
</div>
