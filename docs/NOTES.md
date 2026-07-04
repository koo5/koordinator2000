# Koordinator — working notes

A living scratchpad of what's deferred, what's rough, and what's undecided.
Not a spec; prune freely. Last touched: 2026-07-04.

State of the world: revival is well underway. Self-hosted PG + Hasura, custom
anonymous-first auth (GitHub/Google/email-magic-link/Telegram), two-mode
discovery (mobile swipe deck / desktop lazy list), campaigns with tags +
location + language + country, campaign & cause editing, cs/en i18n, Telegram
bot. Fully self-contained frontend (no third-party CDN, no Firebase). ~38
Playwright tests green.

---

## Strategy — what to do next, in order

**The one thing to internalize: the code is ahead of reality.** The mechanic
works and is well-tested; what's unproven is whether real people will pledge and
act. Every feature we add now is a bet placed *before* seeing the table. The
highest-leverage move is not another feature — it's getting ONE real crowd onto
the live app and letting what breaks decide what to build next.

The trap to avoid: polishing liveness / more countries / richer discovery for an
app nobody uses yet. Resist it. Build in response to a real deck going empty or a
real count feeling untrustworthy — not in anticipation.

**Phase 0 — Make it real (a weekend of ops, no new features).**
- Do the go-live checklist in INFRA.md: domain + TLS, OAuth callback URLs,
  `RESEND_API_KEY` (magic links must actually send), `TELEGRAM_BOT_TOKEN`,
  off-machine backups. Rotate the leaked JWT key (see REVISIT) before public.
- Smoke the live URL end-to-end: a stranger can land, pledge anonymously, get an
  email, come back. If that path has any friction, fix THAT before anything else.
- Add a decent empty/thin-deck state — first users WILL hit near-empty decks, and
  a blank screen reads as "broken/dead."

**Phase 1 — Seed one beachhead (concierge, not scale).**
- Pick ONE specific community you can actually reach (your private incubation
  notes). Not "launch broadly" — one crowd whose members already know each other.
- Hand-author 3–10 real campaigns for them. Real stakes, real thresholds.
- Recruit the first pledgers by hand (DMs, the Telegram bot is the low-friction
  door). Concierge everything; automate nothing yet.
- Watch the DB directly — you don't need analytics infra to see if pledges happen.

**Phase 2 — Validate the loop.**
- Does a threshold actually cross? Does the notification fire? Do people then
  *act*? This is the whole thesis; everything else is decoration until it's true.
- Only now do the deferred features earn their place — and only the one the
  failure points at:
  - decks feel empty → discovery / onboarding / seeding more.
  - the count feels untrustworthy (stale pledges) → **liveness/freshness** (design
    already worked out below).
  - people pledge but don't show → the action-moment coordination (hard; maybe
    not our job — see the liveness caveat).

**Phase 3 — Only then, widen.** Second community, second language market (cs is
already built), more countries. Growth after the loop is proven, not before.

North star for prioritization: *"does this help one real crowd cross one real
threshold?"* If not, it's a Phase-3-or-later nicety.

---

## TODO — concrete, deferred on purpose

- **Causes are thin.** They only have title + description. Campaigns carry
  language/location/country; causes don't. If causes become a browse/relevance
  surface (not just a grouping label), they'll want the same fields.
- **Distance sort is client-side.** "Nearest" reorders the loaded near-me box in
  JS. Fine while the box bounds the set. If we ever page beyond the box, track a
  `campaigns_near(lat, lng)` SETOF function in Hasura for true server-side
  ordering (the `campaign_distance` SQL fn already exists — Haversine).
- **More countries.** `webapp/src/lib/client/countries.ts` is CZ + US only. Add
  codes as markets open; add matching `country.<CODE>` i18n keys.
- **Untranslated surfaces (deliberate).** Long-form/legal pages
  (privacy_policy, terms_of_service, data-deletion guide) — translate when the
  copy is final. Also Settings modal body, dev_area, import_campaign (admin/debug).
- **Prod secrets before go-live** (see docs/INFRA.md checklist): `RESEND_API_KEY`
  so magic-link emails actually send; `TELEGRAM_BOT_TOKEN` for the bot; OAuth
  callback URLs updated to the real domain; off-machine backups.

## REVISIT — works, but rough

- **Legacy static CSS.** `static/global.css` + `static/dropdown.css` still load
  from app.html. Audit what's actually used; fold into `app.css` or drop.
- **Mutation* wrapper family.** `MutationForm` → `MutationSubmitForm` →
  `MutationResult` is ad hoc; `on:done` was silently dead until 2026-07-04. The
  newer code (EditCampaign/EditCause) calls `client.mutation(...)` directly and
  reads cleaner. Consider standardizing on that and retiring the wrappers.
- **Nag cadence.** `decrease_auth_nag_postponement()` now fires on every pledge
  (side effect of the on:done fix). Confirm the "add your email" prompt doesn't
  nag too eagerly; maybe decouple the counter from pledge count.
- **Private key in git history.** `webapp/jwtRS256.key` was removed but remains
  at commit e38eb37. Chose "move on" — but rotate keys + scrub history before any
  public repo / real deployment.
- **`sapper4/` archive** at repo root — historical, deletable at will.

## THINK ABOUT — undecided

- **Cold start is the real problem.** Mechanics work; the hard part is seeding
  real crowds/causes people actually want to join. (User has private notes on
  candidate groups coming.) Everything else is secondary to this.
- **Is default deck filtering too aggressive?** A new anonymous visitor sees only
  their-language campaigns (+ language-agnostic). Relevant, but risks feeling
  empty on day one. Think about onboarding / empty states / a gentle "widen your
  filters" nudge when the deck runs dry.
- **Confirmations → liveness (the promising revival).** The old feature asked
  "did you do it?" — backward, verifiable, shameable (why the public "unconfirmed"
  list got torn out). Reframe as "are you still in?" — forward, opt-in. The real
  problem it solves: **stale-pledge inflation.** A pledge left by someone who
  moved on still pads the threshold; the whole mechanic depends on the count
  being *credible*, so a dead pledge quietly poisons the signal.
  - **Recommended shape: pledge freshness, not activation confirmation.** A pledge
    has a "last affirmed" timestamp; it decays to *dormant* after a window (never
    deleted — one tap wakes it). The matcher computes thresholds over LIVE pledges,
    so the shown count is the count that will act. Re-affirm prompt fires when a
    campaign NEARS its goal ("still in?"), not on a timer — high signal, low nag.
  - **Aggregate-only by construction.** Deck shows a live count; total−live is just
    a number, never a list of names. No shame vector (same principle as private
    dismissals). You can only affirm your OWN single pledge → nothing to game.
  - **Open decision: one number or two?** "89 pledged" (clean) vs "127 pledged · 89
    active" (honest but faintly negative). Leaning: live count is THE number, total
    lives in the detail view.
  - **Caveat:** liveness ≠ attendance. This tracks commitment staying live, not
    whether people showed up. Attendance verification is harder + more shameable —
    probably not Koordinator's job.
  - Schema sketch: `participations.last_affirmed_at timestamptz`; matcher filters
    `condition` computation to `last_affirmed_at > now() - window`; a re-affirm
    mutation bumps the timestamp; notification hook on near-threshold.
- **Notifications reach.** In-app + Telegram push today. Web push? Email digests?
- **Auth spokes.** Passphrase / keypair spokes are designed-not-built. No
  passwords by decision (magic-link is the low-friction path).
- **Discovery split.** Mobile = swipe deck, desktop = lazy list. Settled for now;
  revisit if usage says otherwise.
