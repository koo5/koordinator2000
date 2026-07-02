#!/usr/bin/env bash
# Create Hasura relationships from the Postgres foreign keys, so nested GraphQL
# (participations { account }, campaign_dismissals, tags: campaign_tags { tag })
# works. Tracking tables alone is NOT enough — the app is built entirely on
# these nested relationships. Idempotent: re-running skips already-existing ones.
#
#   scripts/hasura-relationships.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source "$ROOT/.env"

META="${HASURA_URL:-http://127.0.0.1:8080}/v1/metadata"
hdr=(-H "Content-Type: application/json" -H "x-hasura-admin-secret: $HASURA_ADMIN_SECRET")

# obj <child_table> <name> <fk_column>
obj() {
  local resp
  resp=$(curl -s "${hdr[@]}" "$META" -d \
    "{\"type\":\"pg_create_object_relationship\",\"args\":{\"source\":\"default\",\"table\":{\"schema\":\"public\",\"name\":\"$1\"},\"name\":\"$2\",\"using\":{\"foreign_key_constraint_on\":\"$3\"}}}")
  report "object $1.$2" "$resp"
}

# arr <parent_table> <name> <child_table> <fk_column>
arr() {
  local resp
  resp=$(curl -s "${hdr[@]}" "$META" -d \
    "{\"type\":\"pg_create_array_relationship\",\"args\":{\"source\":\"default\",\"table\":{\"schema\":\"public\",\"name\":\"$1\"},\"name\":\"$2\",\"using\":{\"foreign_key_constraint_on\":{\"table\":{\"schema\":\"public\",\"name\":\"$3\"},\"column\":\"$4\"}}}}")
  report "array  $1.$2" "$resp"
}

report() {
  if echo "$2" | grep -q '"message":"success"'; then echo "   created: $1"
  elif echo "$2" | grep -qiE 'already exists|already-exists'; then echo "   exists:  $1"
  else echo "   NOTE ($1): $2"; fi
}

echo "==> Object relationships (child -> parent)..."
obj campaign_dismissals          account     account_id
obj campaign_dismissals          campaign    campaign_id
obj campaign_notifications       account     account_id
obj campaign_notifications       campaign    campaign_id
obj campaign_slugs               campaign    campaign_id
obj campaign_tags                campaign    campaign_id
obj campaign_tags                tag         tag_id
obj campaigns                    cause       cause_id
obj campaigns                    maintainer  maintainer_id
obj causes                       maintainer  maintainer_id
obj participations               account     account_id
obj participations               campaign    campaign_id
obj verified_user_authentications account    account_id

echo "==> Array relationships (parent -> children)..."
arr campaigns  participations           participations            campaign_id
arr campaigns  campaign_dismissals      campaign_dismissals       campaign_id
arr campaigns  campaign_tags            campaign_tags             campaign_id
arr campaigns  campaign_notifications   campaign_notifications    campaign_id
arr campaigns  campaign_slugs           campaign_slugs            campaign_id
arr accounts   participations           participations            account_id
arr accounts   campaign_dismissals      campaign_dismissals       account_id
arr accounts   campaign_notifications   campaign_notifications    account_id
arr accounts   verified_user_authentications verified_user_authentications account_id
arr accounts   campaigns                campaigns                 maintainer_id
arr accounts   causes                   causes                    maintainer_id
arr tags       campaign_tags            campaign_tags             tag_id
arr causes     campaigns                campaigns                 cause_id

echo "==> Done."
