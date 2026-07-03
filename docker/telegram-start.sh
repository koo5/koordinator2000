#!/bin/sh
# The bot is zero-dep; bun auto-loads ./.env (mounted with the service dir),
# which must contain TELEGRAM_BOT_TOKEN and HASURA_ADMIN_SECRET.
cd /app/services/telegram
export PATH="/usr/local/lib/bun/bin:$PATH"
bun run start
