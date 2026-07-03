# Koordinator Telegram bot

A thin client on the **same Hasura/Postgres data plane** as the webapp — not a new
backend. Zero dependencies (raw Bot API over `fetch`), long-polling (no inbound
port to expose), runs on **bun**. Full rationale in [`docs/telegram-bot.md`](../../docs/telegram-bot.md).

## Run

```bash
cp .env.example .env         # add TELEGRAM_BOT_TOKEN + HASURA_ADMIN_SECRET
bun start                    # or: bun run dev  (watch mode)
```

Get a token from [@BotFather](https://t.me/BotFather) (`/newbot`). The data plane
must be up (`scripts/db-init.sh` at the repo root).

## Implemented (verified against Hasura)

- `/start` — links this Telegram user to a Koordinator account (creates it +
  a `telegram` verification spoke on first contact; idempotent).
- `/campaigns` — top campaigns by participant count (live from Hasura).
- `/pledge <#id or title> <N>` — "I'll join if N others do" (upserts a participation).
- `/me` — your pledges.
- **Threshold-crossing push (the killer feature)** — when the matcher flips a
  participation's condition, it writes a `campaign_notifications` row; the bot DMs
  the Telegram-linked user *"🔔 …just reached your critical mass… start acting now!"*.
  Delivery is tracked in the DB (`notification_deliveries` table, channel
  'telegram') — restart-safe, idempotent per notification, retries failed sends,
  and the migration backfills existing rows so there's no history-blast on first run.

Backend logic lives in `koordinator.js` (no Telegram deps), covered by ad-hoc
tests against Hasura: account link + idempotency + spoke creation, campaign lookup
by id/title, pledge upsert, and push detection (crossing detected, chat-id
mapped, non-telegram excluded, watermark dedups).

## Next (in order)

1. **Group semantics** — decide whether a `/pledge` in a group is visible to the
   group (social proof) or DM-only.
2. **JWT parity (optional)** — the bot currently writes via the admin secret
   (server-side). Once desired, have it mint the ES256 JWT (`MY_APP_KEYS`) and go
   through the same permission path as the webapp, for uniformity.
3. **Matcher cadence** — the push is only as timely as the matcher; make sure the
   matcher runs on a tight loop (or event-driven) so "it's real now" is prompt.

## Design notes

- Telegram identity doubles as a **verification spoke** (decent sybil-resistance
  for free) — same hub-and-spoke model as the OAuth providers.
- Long-polling keeps it deployable behind NAT with no webhook endpoint. Switch to
  webhooks only if scale demands it.
