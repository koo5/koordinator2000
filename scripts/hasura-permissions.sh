#!/usr/bin/env bash
# Define Hasura row-level permissions for the two app roles:
#   anonymous - no JWT: public, read-only browsing.
#   user      - authenticated (incl. anonymous-first accounts): read public data
#               + read/write ONLY their own rows (account_id / maintainer_id =
#               X-Hasura-User-Id).
# The admin secret (server-side only) bypasses all of this.
# Idempotent: re-running skips already-defined permissions.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source "$ROOT/.env"

META="${HASURA_URL:-http://127.0.0.1:8080}/v1/metadata"
hdr=(-H "Content-Type: application/json" -H "x-hasura-admin-secret: $HASURA_ADMIN_SECRET")
UID_EQ='{"_eq":"X-Hasura-User-Id"}'

call() { # <type> <permission-json> <label>
  local resp
  resp=$(curl -s "${hdr[@]}" "$META" -d "{\"type\":\"$1\",\"args\":$2}")
  if echo "$resp" | grep -q '"message":"success"'; then echo "   ok:      $3"
  elif echo "$resp" | grep -qiE 'already exists|already-exists'; then echo "   exists:  $3"
  else echo "   NOTE ($3): $resp"; fi
}

sel() { # <table> <role> <columns-json> <filter-json> <allow_agg>
  call pg_create_select_permission \
    "{\"source\":\"default\",\"table\":{\"schema\":\"public\",\"name\":\"$1\"},\"role\":\"$2\",\"permission\":{\"columns\":$3,\"filter\":$4,\"allow_aggregations\":$5}}" \
    "select $1/$2"
}
ins() { # <table> <role> <columns-json> <check-json> [set-json]
  local set="${5-}"
  [ -z "$set" ] && set='{}'
  call pg_create_insert_permission \
    "{\"source\":\"default\",\"table\":{\"schema\":\"public\",\"name\":\"$1\"},\"role\":\"$2\",\"permission\":{\"columns\":$3,\"check\":$4,\"set\":$set}}" \
    "insert $1/$2"
}
upd() { # <table> <role> <columns-json> <filter-json> <check-json>
  call pg_create_update_permission \
    "{\"source\":\"default\",\"table\":{\"schema\":\"public\",\"name\":\"$1\"},\"role\":\"$2\",\"permission\":{\"columns\":$3,\"filter\":$4,\"check\":$5}}" \
    "update $1/$2"
}
del() { # <table> <role> <filter-json>
  call pg_create_delete_permission \
    "{\"source\":\"default\",\"table\":{\"schema\":\"public\",\"name\":\"$1\"},\"role\":\"$2\",\"permission\":{\"filter\":$3}}" \
    "delete $1/$2"
}

# 'nobody' is the OLD default role — existing browser sessions still carry JWTs
# with default_role=nobody, so it needs the public reads too (writes still go via
# the 'user' role their token also allows). New sessions default to 'user'.
echo "==> Public read (anonymous + nobody + user get the same SELECTs on public data)"
for role in anonymous nobody user; do
  sel campaigns          "$role" '"*"' '{}' true
  sel participations     "$role" '"*"' '{}' true
  sel campaign_tags      "$role" '"*"' '{}' false
  sel tags               "$role" '"*"' '{}' false
  sel causes             "$role" '"*"' '{}' false
  sel campaign_slugs     "$role" '"*"' '{}' false
  # accounts: names are public, email/private columns are NOT exposed to clients
  sel accounts           "$role" '["id","name","smazano"]' '{}' false
done

echo "==> Private read (own rows; 'nobody' included so pre-migration JWTs keep working)"
for role in nobody user; do
  sel verified_user_authentications "$role" '["account_id","provider","login_name"]' "{\"account_id\":$UID_EQ}" false
  sel campaign_notifications        "$role" '"*"' "{\"account_id\":$UID_EQ}" false
  upd campaign_notifications        "$role" '["read"]' "{\"account_id\":$UID_EQ}" "{\"account_id\":$UID_EQ}"
  # Dismissals are PRIVATE ("hide from my deck") — only your own rows are
  # visible. The deck's `_not: campaign_dismissals` filter still works: the
  # exists-subquery is evaluated under these same row permissions.
  sel campaign_dismissals           "$role" '"*"' "{\"account_id\":$UID_EQ}" false
done
# anonymous needs the FIELD to exist (the deck query filters on it before the
# anonymous account/JWT is minted) but must see NO rows: never-matching filter.
sel campaign_dismissals anonymous '["campaign_id","account_id"]' '{"account_id":{"_eq":-1}}' false

echo "==> Writes (user only, own rows)"
# participations: I'll join if N others do — the core action. account_id is a
# server-side PRESET from the session (the client mutation omits it), so a user
# can only ever create their own participation.
ins participations user '["campaign_id","threshold","condition_is_fulfilled"]' '{}' '{"account_id":"X-Hasura-User-Id"}'
upd participations user '["threshold","condition_is_fulfilled"]' "{\"account_id\":$UID_EQ}" "{\"account_id\":$UID_EQ}"
del participations user "{\"account_id\":$UID_EQ}"

# dismissals: not interested in this campaign
ins campaign_dismissals user '["campaign_id","account_id"]' "{\"account_id\":$UID_EQ}"
del campaign_dismissals user "{\"account_id\":$UID_EQ}"

# campaigns: create + edit your own
ins campaigns user '["title","description","maintainer_id","cause_id","suggested_lowest_threshold","suggested_highest_threshold","suggested_optimal_threshold","uri","twitter_tag","location_name","latitude","longitude","location_radius"]' "{\"maintainer_id\":$UID_EQ}"
upd campaigns user '["title","description","cause_id","suggested_lowest_threshold","suggested_highest_threshold","suggested_optimal_threshold","uri","twitter_tag","location_name","latitude","longitude","location_radius"]' "{\"maintainer_id\":$UID_EQ}" "{\"maintainer_id\":$UID_EQ}"

# tags: anyone signed in can create a tag; tag/untag only your own campaigns
ins tags user '["name","description"]' '{}'
ins campaign_tags user '["campaign_id","tag_id"]' "{\"campaign\":{\"maintainer_id\":$UID_EQ}}"
del campaign_tags user "{\"campaign\":{\"maintainer_id\":$UID_EQ}}"

# account: rename your own account
upd accounts user '["name"]' "{\"id\":$UID_EQ}" "{\"id\":$UID_EQ}"
# (campaign_notifications read-flag update is granted above for nobody+user)

echo "==> Done. (migrations + accounts.email + verified_user_authentications writes remain admin-only.)"
