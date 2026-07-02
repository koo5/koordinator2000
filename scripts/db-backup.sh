#!/usr/bin/env bash
# Timestamped pg_dump of the local Postgres, with rotation.
# The whole point of self-hosting: never lose the data to an idle free tier again.
#
#   scripts/db-backup.sh
#
# Cron example (daily at 03:30, keep the log):
#   30 3 * * * cd /home/koom/repos/koo5/koordinator2000/0/koordinator2000 && \
#              scripts/db-backup.sh >> backups/backup.log 2>&1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source "$ROOT/.env"

KEEP="${KEEP:-30}"            # how many dumps to retain
OUTDIR="$ROOT/backups"
mkdir -p "$OUTDIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$OUTDIR/koordinator_${STAMP}.sql.gz"

echo "==> Dumping to $OUT"
docker compose exec -T postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  | gzip > "$OUT"

# Guard against writing an empty/broken dump.
if [ ! -s "$OUT" ] || [ "$(gzip -dc "$OUT" | head -c 20 | wc -c)" -lt 10 ]; then
  echo "!! Backup looks empty — removing $OUT" >&2
  rm -f "$OUT"
  exit 1
fi

echo "==> OK ($(du -h "$OUT" | cut -f1)). Pruning to newest $KEEP."
ls -1t "$OUTDIR"/koordinator_*.sql.gz 2>/dev/null | tail -n +"$((KEEP+1))" | xargs -r rm -f

echo "==> Current backups:"
ls -lht "$OUTDIR"/koordinator_*.sql.gz 2>/dev/null | head -5
