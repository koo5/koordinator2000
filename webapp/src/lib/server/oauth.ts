/**
 * OAuth providers via Arctic.
 *
 * Arctic ONLY performs the provider handshake (authorization URL + code
 * exchange). We keep our own model: an account hub + `verified_user_authentications`
 * spokes + our own ES256 Hasura JWT. The callback turns a provider identity into
 * a verified spoke (see link_or_create_oauth_account in server/auth.ts).
 *
 * To add a provider: import its Arctic class and add a getter here + a
 * routes/auth/<provider>/{login,callback} pair. GitHub needs no PKCE; providers
 * like Google do (createAuthorizationURL takes a codeVerifier).
 */
import { GitHub, Google } from 'arctic';
import { server_env } from '$lib/server/env';

let _github: GitHub | null = null;
let _google: Google | null = null;

export function githubConfigured(): boolean {
    return !!(server_env.GITHUB_CLIENT_ID && server_env.GITHUB_CLIENT_SECRET);
}

export function getGitHub(): GitHub {
    if (!githubConfigured()) {
        throw new Error('GitHub OAuth is not configured (set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET)');
    }
    if (!_github) {
        const redirectURI = `${server_env.PUBLIC_URL}/auth/github/callback`;
        _github = new GitHub(server_env.GITHUB_CLIENT_ID, server_env.GITHUB_CLIENT_SECRET, redirectURI);
    }
    return _github;
}

export function googleConfigured(): boolean {
    return !!(server_env.GOOGLE_CLIENT_ID && server_env.GOOGLE_CLIENT_SECRET);
}

export function getGoogle(): Google {
    if (!googleConfigured()) {
        throw new Error('Google OAuth is not configured (set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)');
    }
    if (!_google) {
        const redirectURI = `${server_env.PUBLIC_URL}/auth/google/callback`;
        _google = new Google(server_env.GOOGLE_CLIENT_ID, server_env.GOOGLE_CLIENT_SECRET, redirectURI);
    }
    return _google;
}
