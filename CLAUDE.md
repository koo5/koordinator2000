# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands
- **Data plane** (Postgres :5434 + Hasura :8080, localhost-only): `scripts/db-init.sh`
  (idempotent: restores the dump if empty, migrates, tracks tables + relationships + permissions)
- **Webapp**: `cd webapp && bun run dev` (port 5533) — bun, not npm
- **Webapp TypeCheck**: `cd webapp && bun run typecheck`
- **Webapp tests**: `cd webapp && bun run test:playwright` (needs data plane + dev server)
- **Matcher**: `cd services/matcher && bun start` (threshold engine — zero deps)
- **Telegram bot**: `cd services/telegram && bun start` (needs TELEGRAM_BOT_TOKEN)
- **DB migration**: add `db/migrations/<timestamp>_name.sql`, apply with `docker compose run --rm migrations`
- **Backups**: `scripts/db-backup.sh` (rotating pg_dump into backups/)
- **Prod**: `docker compose --profile prod up -d --build` (see docs/INFRA.md; TLS via the host's global Caddy)

## Architecture
- **webapp/**: SvelteKit + TypeScript, Tailwind v4 + DaisyUI v5 (CSS-first config in
  `src/app.css`; no tailwind.config.js), URQL for GraphQL (queries + WS subscriptions)
- **Auth**: custom hub-and-spoke — `accounts` hub + `verified_user_authentications`
  spokes (github/google/email/telegram). Anonymous-first: an account + ES256 JWT
  (`MY_APP_KEYS`) is minted on first visit. OAuth handshakes via `arctic`
  (`lib/server/oauth*.ts`), email magic-link (stateless signed token), JWTs verified
  server-side (`verify_user_jwt`) and by Hasura (JWT mode). NO Auth.js, NO Keycloak, NO passwords.
- **Hasura authz**: roles `anonymous` (public read) / `user` (own-row writes, scoped by
  X-Hasura-User-Id; participations insert presets account_id from the session).
  Defined in `scripts/hasura-permissions.sh` — permissions/relationships/tracking are
  code, re-runnable, idempotent. The admin secret is SERVER-side only, never in client bundles.
- **services/matcher/**: polls every 2s, computes the assurance cascade per campaign
  (`compute_flips` is pure), batch-flips `condition_is_fulfilled` + writes
  `campaign_notifications`. Zero deps.
- **services/telegram/**: thin client on the same Hasura; links Telegram ids as
  verification spokes, `/pledge`, and DMs threshold crossings (delivery tracked in the
  `notification_deliveries` table). Zero deps.
- **Secrets**: gitignored `.env` files only (root + webapp/). Never commit keys
  (`*.key`/`*.pem` are gitignored); the Hasura JWT public key is derived into `.env`
  by `scripts/gen-jwt-secret.mjs`. Never log `server_env`/tokens.

## Code Style Guidelines
- **TypeScript** in the webapp; explicit types; `strictNullChecks` on
- **Imports**: include file extensions (e.g., `import x from './y.ts'`)
- **Components**: PascalCase Svelte files; **variables/functions**: snake_case
- **Error handling**: try/catch with console.error
- **Env vars**: client-visible need the `VITE_` prefix; secrets never get it
- **Browser checks**: `import { browser } from '$app/environment'`
- **Async**: prefer async/await
- **Services**: plain ESM on bun, zero dependencies preferred (raw fetch to Hasura)
- **Supply chain**: prefer mature "cooled-off" deps, pin exact versions, avoid adding
  packages casually; bun's no-postinstall default is a feature
