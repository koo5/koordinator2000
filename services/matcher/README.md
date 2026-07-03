# Participation Matcher Service

## Overview
The Participation Matcher service monitors campaigns and their participation thresholds, sending notifications when campaigns reach or fall below user-defined critical mass thresholds.

## How It Works

### Core Algorithm
The matcher continuously polls the database for campaigns and their participation records, then:

1. For each campaign, counts the total number of participants
2. Evaluates each participation record's threshold against the current count
3. Updates the fulfillment status of thresholds that have changed
4. Sends notifications to users when their thresholds are reached or no longer met

### Notification Types
- **Threshold Reached**: "Heads up! [campaign title] just reached your defined critical mass of [threshold]! Start acting now!"
- **Threshold Lost**: "Heads up! [campaign title] just un-reached your defined critical mass of [threshold]! Go back home now, it's pointless!"

### Process Flow
1. Fetches all campaigns with their participation records (ordered by threshold)
2. For each campaign:
   - Determines which participation thresholds are fulfilled based on participant count
   - Identifies participation records that need status updates
   - Updates status flags and sends appropriate notifications

## Technical Details

### Dependencies
None — raw `fetch` against Hasura's GraphQL API, running on **bun**.

### Execution Model
- Continuous polling loop, `MATCHER_INTERVAL_SECONDS` (default 2s); 20s backoff on errors.
- **All flips in a pass are applied as one batched mutation** (notification inserts
  plus both update directions), so a mass crossing notifies everyone in one pass.
- `compute_flips()` is a pure function — test algorithm changes there.

### Environment
Loaded from `./.env` (docker mounts the repo root `.env` here), falling back to
the repo root `.env`: `KOORDINATOR_GRAPHQL_ENDPOINT` (default
`http://127.0.0.1:8080/v1/graphql`), `HASURA_ADMIN_SECRET`, `MATCHER_INTERVAL_SECONDS`.

## Usage
Run with `bun start`, or `bun run dev` for watch mode.