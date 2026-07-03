# CLAUDE.md - Matcher service

## Commands
- **Start**: `bun start` (or `bun run dev` for watch mode)
- No install needed — zero dependencies (raw `fetch` against Hasura, runs on bun).

## What it is
The threshold-resolution engine. Every `MATCHER_INTERVAL_SECONDS` (default 2) it
walks each campaign's participations sorted by threshold ascending, computes the
stable fulfilled prefix (assurance cascade), and batch-flips any participation
whose `condition_is_fulfilled` disagrees — writing a `campaign_notifications`
row per flip (consumed by the webapp UI and pushed by services/telegram).

## Environment
Loaded from `./.env` (docker mounts the repo root `.env` here) with a fallback
to the repo root `../../.env`:
- `KOORDINATOR_GRAPHQL_ENDPOINT` — default `http://127.0.0.1:8080/v1/graphql`
- `HASURA_ADMIN_SECRET` — required
- `MATCHER_INTERVAL_SECONDS` — default 2

## Code style
- ESM, snake_case functions, async/await, 4-space indent.
- `compute_flips()` is pure — test algorithm changes there first.
- All flips in a pass go in ONE batched mutation (never one-per-pass).
