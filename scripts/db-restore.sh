#!/usr/bin/env bash
# Restore a chosen backup (or any .sql / .sql.gz dump) into the local Postgres.
# DESTRUCTIVE-ish: it replays into the existing DB. For a clean restore, drop the
# volume first:  docker compose down && docker volume rm <project>_pgdata
#
#   scripts/db-restore.sh backups/koordinator_20260702_033000.sql.gz
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source "$ROOT/.env"

FILE="${1:?usage: db-restore.sh <dump.sql|dump.sql.gz>}"
[ -f "$FILE" ] || { echo "!! Not found: $FILE" >&2; exit 1; }

echo "==> Ensuring 'avnadmin' role exists..."
docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='avnadmin') THEN CREATE ROLE avnadmin NOLOGIN; END IF; END \$\$;"

echo "==> Restoring $FILE"
case "$FILE" in
  *.gz) gzip -dc "$FILE" | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" ;;
  *)    docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$FILE" ;;
esac
echo "==> Done."
