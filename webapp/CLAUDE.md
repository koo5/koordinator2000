# Koordinator Frontend Development Guide

## Development Commands
Runs on **bun** (see the repo root CLAUDE.md for toolchain paths).
- **Start Dev Server**: `bun run dev` (port 5533)
- **Build for Production**: `bun run build` (SvelteKit **adapter-node** — the app
  has server routes, so prod needs a running Node server: `bun run start`)
- **TypeScript Check**: `bun run typecheck`
- **E2E tests**: `bun run test:playwright` (standalone package in `tests-playwright/`;
  single worker; reuses a running dev server; needs the local data plane up)

## Environment Setup
Copy `.env.example` to `.env`. The important variables:

```
# Client-visible (VITE_ prefix). NO admin secret here — the browser
# authenticates to Hasura with the user's JWT.
VITE_PUBLIC_GRAPHQL_ENDPOINT="http://127.0.0.1:8080/v1/graphql"   # full URL; scheme respected
VITE_PUBLIC_URL="http://localhost:5533"                            # OAuth redirects derive from this
VITE_PUBLIC_GRAPHQL_HEADERS='{"content-type":"application/json"}'

# Server-side only:
MY_APP_KEYS='{"private":{...},"public":{...}}'   # ES256 JWK pair; server refuses to start without it
HASURA_ADMIN_SECRET="..."                         # server routes only (account creation, OAuth linking)
GITHUB_CLIENT_ID/SECRET, GOOGLE_CLIENT_ID/SECRET  # Arctic OAuth apps (callback /auth/<provider>/callback)
RESEND_API_KEY, EMAIL_FROM                        # magic-link email; unset => dev mode (link logged + returned)
```

Generate MY_APP_KEYS with `generate_key_pair.ts`. The Hasura side derives its JWT
verification key from it via `scripts/gen-jwt-secret.mjs` (run by db-init.sh).

## Auth architecture (hub-and-spoke, anonymous-first)
- On first visit the app POSTs `/get_free_user_id` → a fresh `accounts` row + a
  signed ES256 JWT, stored in localStorage as `my_user`. No login needed to pledge.
- "Signing in" ATTACHES a verified identity (a `verified_user_authentications` row)
  to the account — it never replaces the account. Providers: GitHub + Google
  (Arctic, `lib/server/oauth.ts` + `routes/auth/<provider>/*`), email magic-link
  (stateless signed token, `routes/auth/email/*`), Telegram (via the bot).
- Sessions reach Hasura as `Authorization: Bearer <jwt>`; Hasura verifies the
  signature (JWT mode) and enforces row-level permissions (roles: `anonymous`,
  `user`; older tokens may carry `nobody`). Server-side JWT verification is
  `verify_user_jwt` in `lib/server/auth.ts` — never trust a decoded-only token.
- NO Auth.js, NO Keycloak, NO passwords (decision: email magic-link + future
  passphrase/keypair spokes instead).

## GraphQL / URQL
- Client: `lib/urql.ts` (queries, mutations, WS subscriptions; sends the JWT).
  `createRoleClient('user')` adds `x-hasura-role: user`.
- Server: `lib/server/urql.ts` — admin client, **fetch-only, no cache exchange**
  (a document cache serves stale reads across requests; this caused a
  duplicate-account bug once — don't re-add it).
- Endpoints are normalized by `toHttpUrl()` — full URLs keep their scheme (local
  http works); bare hosts default to https.

## Styling
Tailwind **v4** + DaisyUI **v5**, CSS-first: config lives in `src/app.css`
(`@import 'tailwindcss'` + `@plugin 'daisyui'`) via `@tailwindcss/vite`.
There is no tailwind.config.js / postcss.config.js — don't recreate them.

## Code Style Guidelines
- **Modules**: ES modules; TypeScript for all new code; include file extensions in imports
- **Components**: `.svelte`, PascalCase; **variables/functions**: snake_case
- **Stores**: typed Svelte stores; `localStorageSharedStore` for cross-tab state
- **Navigation**: `$app/navigation` / `$app/stores`; `browser` from `$app/environment`
- **Error handling**: try/catch + console.error — but never log tokens or env objects
- **UI components**: DaisyUI (https://daisyui.com/llms.txt)

## SvelteKit Conventions
- Pages: `+page.svelte` (+ `+page.ts`/`+page.server.ts` loads); endpoints: `+server.ts`
- Server-only code lives under `lib/server/` and must never be imported client-side

## Testing gotchas (tests-playwright/)
- Import `{ test, expect }` from `./fixtures` (collects console errors).
- Click UI controls only AFTER hydration — wait for a campaign `h2` first;
  pre-hydration clicks silently no-op.
- The email magic-link dev flow (`devLink` in the response) is the standard way
  to get a signed-in user in tests.
