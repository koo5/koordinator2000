# Infra: the garden bed

Self-hosted **Postgres + Hasura**, run with Docker Compose. The goal is a data
plane that (a) never gets reclaimed by an idle free tier again, and (b) can't get
your machine owned. Grow it slowly; keep it boring and safe.

## TL;DR

```bash
cp .env.example .env          # then fill in secrets: openssl rand -hex 24
scripts/db-init.sh            # brings up Postgres, restores the April dump, migrates, starts Hasura
scripts/db-backup.sh          # take a backup now; then cron it (see below)
```

- Postgres → `127.0.0.1:5434` (db `koordinator`)
- Hasura console → `http://127.0.0.1:8080/` (admin secret in `.env`)

## What runs where

| Service   | Image                          | Bind            | Notes |
|-----------|--------------------------------|-----------------|-------|
| postgres  | `postgres:16.8-alpine`         | `127.0.0.1:5434`| matches the dump's PG 16.8; data in the `pgdata` volume |
| hasura    | `hasura/graphql-engine:v2.44.1`| `127.0.0.1:8080`| GraphQL API + live subscriptions |
| migrations| built locally (bun)            | —               | applies `db/migrations/*.sql`, then exits |

The webapp and matcher still use host networking and reach Hasura at
`127.0.0.1:8080`.

## Loading the April 2025 dump

`scripts/db-init.sh` handles it. Order matters and the script gets it right:

1. start Postgres, wait for healthy
2. create a no-login **`avnadmin`** role — the dump came from Aiven and every
   object is `OWNER TO avnadmin`; without the role the restore errors out
3. restore the dump **only if the DB is empty** (checks for `public.campaigns`)
4. run migrations — the dump already contains migrations 1–6, so only
   `20250414_add_campaign_slugs` gets applied on top

Re-running the script is safe: it skips the restore once data exists.

## Backups — the whole point

```bash
scripts/db-backup.sh          # → backups/koordinator_<stamp>.sql.gz, keeps newest 30
scripts/db-restore.sh backups/koordinator_<stamp>.sql.gz
```

Cron it (daily 03:30):

```cron
30 3 * * * cd /home/koom/repos/koo5/koordinator2000/0/koordinator2000 && scripts/db-backup.sh >> backups/backup.log 2>&1
```

For real safety, copy `backups/` off the machine periodically (rsync/rclone to
another disk or cloud). A backup on the same disk only protects against the
free-tier problem, not a dead drive.

## Security posture — "don't let my puter catch malware"

What's already done here:

- **Nothing is exposed beyond localhost.** Both ports bind `127.0.0.1` only —
  not reachable from the LAN or internet. This is the single biggest lever.
- **No default passwords.** Compose refuses to start if `POSTGRES_PASSWORD` /
  `HASURA_ADMIN_SECRET` are unset. Secrets live in `.env`, which is gitignored.
- **Hasura hardened:** `DEV_MODE=false` (no internal error leakage), telemetry
  off, no anonymous role, admin secret required, CORS limited to the dev origins.
- **Pinned image versions** (not `:latest`) so an image can't silently change
  under you.

## Production mode

Everything stays localhost-bound; the VPS's **global Caddy** does TLS and
reverse-proxies the domain to the webapp. Bring-up (base file + prod override):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

That runs: postgres + hasura + migrations + **matcher** (the threshold heartbeat,
always on) + **webapp** (adapter-node build; runs on the `koord_net` bridge and
is published to `127.0.0.1:5533` **only** — not `0.0.0.0`) + **telegram** (needs
`TELEGRAM_BOT_TOKEN` in `services/telegram/.env`).

Compose is split so the bind can't drift: the base `docker-compose.yml` holds the
shared `webapp` definition with no network config; `docker-compose.dev.yml` adds
host networking, `docker-compose.prod.yml` adds the bridge + the loopback publish.

Global Caddy site block (the only public entry point):

```caddy
koordinator.example.org {
    reverse_proxy 127.0.0.1:5533
}
```

The browser talks GraphQL to Hasura — either give Hasura its own subdomain
(`hasura.example.org { reverse_proxy 127.0.0.1:8080 }`) or proxy a path. Set
`VITE_PUBLIC_GRAPHQL_ENDPOINT` accordingly.

### Go-live checklist (things that change with the domain)

- `webapp/.env`: `VITE_PUBLIC_URL=https://your.domain` (OAuth redirects derive
  from it), `VITE_PUBLIC_GRAPHQL_ENDPOINT=https://hasura.your.domain/v1/graphql`
- root `.env`: `KOORD_CORS_DOMAIN=https://your.domain` (Hasura CORS)
- **OAuth apps**: update the GitHub/Google callback URLs to
  `https://your.domain/auth/{github,google}/callback` (or register second apps
  and keep localhost ones for dev)
- email: set the email API key so magic links actually send (see
  `webapp/src/lib/server/email.ts`)
- **backups off-machine**: cron `scripts/db-backup.sh` AND rsync/rclone
  `backups/` to another box — a same-disk backup doesn't survive a dead drive
- firewall: default-deny inbound except Caddy's 80/443; never publish 5434/8080
- consider pinning images by digest (`docker inspect --format
  '{{index .RepoDigests 0}}' postgres:16.8-alpine`)
- rotate `HASURA_ADMIN_SECRET` + the DB password for the public instance

## Common commands

```bash
docker compose up -d postgres hasura     # just the data plane
docker compose logs -f hasura            # watch Hasura
docker compose exec postgres psql -U koordinator koordinator   # psql shell
docker compose down                      # stop (keeps the volume/data)
docker compose down -v                   # stop AND delete data (careful!)
```
