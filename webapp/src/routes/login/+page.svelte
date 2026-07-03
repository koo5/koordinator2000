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

<svelte:head>
    <title>Sign in - Koordinator</title>
</svelte:head>

<div class="login-wrap">
    <div class="login-card">
        <h2 class="mt-0">Sign in</h2>
        <p class="text-sm opacity-70 mt-1 mb-5">
            Signing in <b>adds a verified identity</b> to your account — it never replaces it.
            If you've been using Koordinator anonymously, your pledges carry over.
        </p>

        <div class="flex flex-col gap-2.5">
            <button class="btn btn-neutral justify-start gap-3" on:click={() => loginWith('github')}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                Continue with GitHub
            </button>
            <button class="btn btn-outline justify-start gap-3" on:click={() => loginWith('google')}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.8z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A11.99 11.99 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.29a12 12 0 0 0 0 10.78l4-3.1z"/><path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.97 11.97 0 0 0 12 0 11.99 11.99 0 0 0 1.29 6.61l4 3.1C6.23 6.87 8.88 4.76 12 4.76z"/></svg>
                Continue with Google
            </button>
        </div>

        <div class="divider text-xs opacity-60">or use your email — no password</div>

        <form on:submit|preventDefault={sendMagicLink} class="flex flex-col gap-2.5">
            <input class="input input-bordered w-full" type="email" bind:value={email} placeholder="you@example.com" required />
            <button class="btn btn-primary" type="submit">Send me a sign-in link</button>
        </form>

        {#if emailStatus}<p class="mt-3 mb-0 text-sm">{emailStatus}</p>{/if}
        {#if devLink}
            <p class="mt-1 mb-0 text-xs opacity-60">Dev link (email not configured): <a class="link" href={devLink}>open</a></p>
        {/if}
    </div>
</div>

<style>
    .login-wrap {
        display: flex;
        justify-content: center;
        padding: 2.5rem 1rem;
    }
    .login-card {
        width: 100%;
        max-width: 24rem;
        background: var(--color-base-100);
        border: 1px solid var(--color-base-300);
        border-radius: var(--radius-box, 0.75rem);
        padding: 1.75rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }
</style>
