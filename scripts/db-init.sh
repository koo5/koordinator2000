#!/usr/bin/env bash
# Bring up the local data plane and (on first run) restore the April 2025 dump.
#
#   scripts/db-init.sh [path-to-dump.sql]
#
# Idempotent: if the DB already has a `campaigns` table it skips the restore and
# just applies any new migrations. Default dump is the April 2025 snapshot.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DUMP="${1:-$ROOT/../../koordinator2025-04-08_04-01-45.sql}"
source "$ROOT/.env"

echo "==> Starting Postgres..."
docker compose up -d postgres

echo "==> Waiting for Postgres to be healthy..."
until docker compose exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 1
done

# The dump was taken from Aiven and references the `avnadmin` role as owner.
# Create it (no login) so `OWNER TO avnadmin` statements don't fail on restore.
echo "==> Ensuring 'avnadmin' role exists (for dump ownership statements)..."
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='avnadmin') THEN CREATE ROLE avnadmin NOLOGIN; END IF; END \$\$;"

ALREADY=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "SELECT to_regclass('public.campaigns') IS NOT NULL;")

if [ "$ALREADY" = "t" ]; then
  echo "==> DB already populated (public.campaigns exists) — skipping restore."
else
  if [ ! -f "$DUMP" ]; then
    echo "!! Dump not found at: $DUMP" >&2
    echo "   Pass a path explicitly, or let migrations build a fresh schema instead." >&2
    exit 1
  fi
  echo "==> Restoring dump: $DUMP"
  docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$DUMP"
  echo "==> Restore complete."
fi

echo "==> Applying migrations (any newer than the dump)..."
docker compose run --rm migrations

echo "==> Starting Hasura..."
docker compose up -d hasura

echo "==> Waiting for Hasura to be healthy..."
until curl -sf "http://127.0.0.1:8080/healthz" >/dev/null 2>&1; do sleep 1; done

# Track tables AND create relationships from foreign keys. Both are required:
# tables alone give a GraphQL API with no nested fields, and the whole app is
# built on nested relationships (participations { account }, campaign_tags, ...).
"$ROOT/scripts/hasura-track.sh"
"$ROOT/scripts/hasura-relationships.sh"

echo ""
echo "Data plane is up:"
echo "  Postgres : 127.0.0.1:5434 (db=$POSTGRES_DB user=$POSTGRES_USER)"
echo "  Hasura   : http://127.0.0.1:8080/  (console; admin secret in .env)"
echo ""
echo "Next: run scripts/db-backup.sh (and cron it) so you never lose data again."
