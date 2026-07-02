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

If you ever expose this to the internet (to run the real site), do NOT just flip
the bind to `0.0.0.0`. Instead:

- put a reverse proxy (Caddy/nginx) with TLS in front of Hasura; keep Postgres
  private (never publish 5434 publicly)
- set a firewall (ufw) default-deny inbound
- consider pinning images by **digest** (`@sha256:...`) — get the digest with
  `docker inspect --format '{{index .RepoDigests 0}}' postgres:16.8-alpine`
- rotate `HASURA_ADMIN_SECRET` and the DB password; never reuse them elsewhere
- keep the admin secret out of any client-side bundle (the webapp currently sends
  it from the browser — that changes when we do the auth pass)

## Common commands

```bash
docker compose up -d postgres hasura     # just the data plane
docker compose logs -f hasura            # watch Hasura
docker compose exec postgres psql -U koordinator koordinator   # psql shell
docker compose down                      # stop (keeps the volume/data)
docker compose down -v                   # stop AND delete data (careful!)
```
