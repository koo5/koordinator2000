# Telegram bot — preliminary design

Status: **skeleton built** in [`services/telegram/`](../services/telegram/) — `/start` and `/campaigns` work against the local Hasura (verified). Needs a bot token from @BotFather to run against Telegram. Next: account linking, `/pledge`, threshold-crossing push (see the service README).

## Why Telegram is a strong bet

The whole Koordinator product is one message: *"your condition is met — N people are in, it's real now, go."* Telegram is where that ping lives, with zero app install. And coordination is inherently group-shaped: activist Telegram groups are exactly the already-critical-mass crowds to piggyback (see the cold-start reasoning in the revival plan). So the bot is both a **participation surface** and a **notification channel** — and, bonus, a decent **verification provider** (Telegram identity → a `verified_user_authentications` spoke).

## Architecture: a thin client on the same backend

The bot is NOT a new backend. It's another client of the existing Hasura/Postgres data plane — the same one the webapp uses.

```
Telegram  <->  bot service (services/telegram)  <->  Hasura (GraphQL)  <->  Postgres
                                   |
                                   +-- signs the same ES256 JWT (MY_APP_KEYS) to act as a user
```

- **Reuse the account model.** A Telegram user maps to a Koordinator `account` via `verified_user_authentications(provider='telegram', login_name=<telegram_user_id>)`. First contact = create an account (like the anonymous flow) + attach the telegram spoke.
- **Reuse the JWT.** The bot mints the same ES256 JWT the webapp does, so Hasura authorization is identical. (Depends on the auth-pass JWT/permissions work — until then the bot can use the admin secret server-side.)
- **Reuse the matcher.** Threshold-crossing detection already lives in `services/matcher`. The bot just subscribes/queries and pushes messages when a user's condition flips to fulfilled.

## Commands (v1 sketch)

- `/start` — create/link account, greet, explain.
- `/campaigns` — list a few relevant campaigns (near-threshold first).
- `/pledge <campaign> <N>` — "I'll join if N others do" (a participation with threshold N). The killer low-friction entry, especially inside a group.
- `/me` — my pledges and their status.
- **Push (the point):** when the matcher flips a user's `condition_is_fulfilled`, DM them: "✅ Your threshold on <campaign> is met — 47 in. It's real now." This is the magic moment.

## Stack choice (supply-chain-aware)

- Runtime: **bun** (consistent with the rest of the repo).
- Library: prefer a **minimal, cooled-off** Telegram lib (e.g. grammY — mature, well-maintained, small surface) OR raw Bot API over fetch (zero deps, the Bot API is simple long-polling/webhook JSON). Given the supply-chain stance, raw fetch for v1 is defensible.
- Deploy: another service in `docker-compose.yml`, bound to the same network; long-polling (no inbound port) is simplest and safest — no webhook endpoint to expose.

## Sequencing

1. Auth pass first (so the bot can mint real user JWTs instead of admin secret).
2. Skeleton: `services/telegram` — long-poll loop, `/start` → account link.
3. `/pledge` + `/me` reading/writing participations via Hasura.
4. Push notifications wired to the matcher's threshold-crossing.
5. Seed one real activist group as the first incubation crowd.

## Open questions for the user

- Which crowd/group to target first (waiting on the private incubation notes)?
- Group semantics: should a `/pledge` in a group be visible to the group (social proof) or DM-only?
