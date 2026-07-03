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

## Implemented

- `/start` — welcome + pitch.
- `/campaigns` — top campaigns by participant count (live from Hasura).
- `/pledge` — placeholder.

## Next (in order)

1. **Account linking** — map a Telegram user id to a Koordinator `account` via
   `verified_user_authentications(provider='telegram', login_name=<tg_user_id>)`,
   creating the account on first contact (mirrors the webapp's anonymous-first flow).
   Reuse the ES256 JWT signing (`MY_APP_KEYS`) so the bot acts as the user — this
   lands cleanly once the auth-pass JWT/permissions work is done; until then the
   bot uses the admin secret server-side.
2. **`/pledge <campaign> <N>`** — insert a participation (threshold N).
3. **Threshold-crossing push** — subscribe to / poll the matcher's
   `condition_is_fulfilled` flips and DM the user: "✅ Your threshold on X is met."
4. **Group semantics** — decide whether a `/pledge` in a group is visible to the
   group (social proof) or DM-only.

## Design notes

- Telegram identity doubles as a **verification spoke** (decent sybil-resistance
  for free) — same hub-and-spoke model as the OAuth providers.
- Long-polling keeps it deployable behind NAT with no webhook endpoint. Switch to
  webhooks only if scale demands it.
