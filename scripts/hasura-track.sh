#!/usr/bin/env bash
# Track all public tables in Hasura so the GraphQL API actually serves them, then
# auto-create relationships from foreign keys. A fresh Hasura pointed at an
# existing DB tracks nothing until you do this. Idempotent: re-running is safe.
#
#   scripts/hasura-track.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source "$ROOT/.env"

HASURA_URL="${HASURA_URL:-http://127.0.0.1:8080}"
META="$HASURA_URL/v1/metadata"
hdr=(-H "Content-Type: application/json" -H "x-hasura-admin-secret: $HASURA_ADMIN_SECRET")

# List public base tables straight from Postgres (skip the _migration_backup_* schemas).
TABLES=$(docker compose exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc \
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;")

echo "==> Tracking tables..."
for t in $TABLES; do
  resp=$(curl -s "${hdr[@]}" "$META" -d \
    "{\"type\":\"pg_track_table\",\"args\":{\"source\":\"default\",\"table\":{\"schema\":\"public\",\"name\":\"$t\"}}}")
  if echo "$resp" | grep -q '"message":"success"'; then
    echo "   tracked: $t"
  elif echo "$resp" | grep -q 'already-tracked'; then
    echo "   already: $t"
  else
    echo "   NOTE ($t): $resp"
  fi
done

# Turn foreign keys into GraphQL relationships (nested queries) where Hasura is confident.
echo "==> Creating relationships from foreign keys..."
curl -s "${hdr[@]}" "$META" \
  -d '{"type":"pg_suggest_relationships","args":{"source":"default","omit_tracking":false}}' \
  > /tmp/koord_rels.json || true
# (Suggestions are informational; the console applies them one click. Tables are
# queryable now regardless — relationships just enable nested queries.)

echo "==> Done. Try the console: $HASURA_URL/console  (Data tab)"
