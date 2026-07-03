/**
 * Participation matcher — the threshold-resolution engine.
 *
 * Walks each campaign's participations sorted by threshold ascending and finds
 * the stable fulfilled prefix (the classic assurance cascade: a participation
 * counts as fulfilled when more than `threshold` participants precede-or-equal
 * it in the cascade). Any participation whose stored `condition_is_fulfilled`
 * disagrees gets flipped, and a campaign_notifications row is written (which
 * the webapp shows and the Telegram bot pushes).
 *
 * All flips in a pass are applied in ONE batch (previously it flipped one per
 * pass, so a 47-person crossing took 47 polling cycles to notify everyone).
 *
 * Zero deps: raw fetch against Hasura, same style as services/telegram.
 */

const GQL = process.env.KOORDINATOR_GRAPHQL_ENDPOINT || 'http://127.0.0.1:8080/v1/graphql';
const ADMIN = process.env.HASURA_ADMIN_SECRET || '';

export async function gql(query, variables) {
    const res = await fetch(GQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(ADMIN ? { 'x-hasura-admin-secret': ADMIN } : {}) },
        body: JSON.stringify({ query, variables }),
    });
    const j = await res.json();
    if (j.errors) throw new Error(JSON.stringify(j.errors));
    return j.data;
}

async function fetch_campaigns() {
    const data = await gql(`
        query GET_PARTICIPATIONS {
            campaigns(order_by: [{ id: asc }]) {
                id
                title
                participations(order_by: [{ threshold: asc }], where: { account: { smazano: { _eq: false } } }) {
                    id
                    account_id
                    campaign_id
                    threshold
                    condition_is_fulfilled
                }
            }
        }
    `);
    return data.campaigns;
}

/**
 * Pure function: compute the flips a campaign needs.
 * Algorithm preserved exactly from the original matcher: for 1-based position i
 * in the threshold-ascending order, the fulfilled prefix ends at the last i
 * where threshold < i; everything after is unfulfilled.
 * Returns [{ participation, fulfilled }] for participations that need flipping.
 */
export function compute_flips(campaign) {
    const ps = campaign.participations;
    let last_fulfilled_idx = -1; // 0-based index of the last fulfilled participation
    ps.forEach((p, i0) => {
        if (p.threshold < i0 + 1) last_fulfilled_idx = i0;
    });

    const flips = [];
    ps.forEach((p, i0) => {
        const fulfilled = i0 <= last_fulfilled_idx;
        if (p.condition_is_fulfilled !== fulfilled) flips.push({ participation: p, fulfilled });
    });
    return flips;
}

function notification_content(campaign, p, fulfilled) {
    return fulfilled
        ? `Heads up! "${campaign.title}" just reached your defined critical mass of ${p.threshold}! Start acting now!`
        : `Heads up! "${campaign.title}" just un-reached your defined critical mass of ${p.threshold}! Go back home now, it's pointless!`;
}

/** Apply all flips for all campaigns in one batched round of mutations. */
export async function apply_flips(all_flips) {
    if (!all_flips.length) return;

    const notifications = all_flips.map(({ campaign, participation: p, fulfilled }) => ({
        account_id: p.account_id,
        campaign_id: p.campaign_id,
        content: notification_content(campaign, p, fulfilled),
    }));
    const to_true = all_flips.filter(f => f.fulfilled).map(f => f.participation.id);
    const to_false = all_flips.filter(f => !f.fulfilled).map(f => f.participation.id);

    await gql(
        `mutation Flip($notifications: [campaign_notifications_insert_input!]!, $to_true: [Int!]!, $to_false: [Int!]!) {
            insert_campaign_notifications(objects: $notifications) { affected_rows }
            fulfilled: update_participations(where: { id: { _in: $to_true } }, _set: { condition_is_fulfilled: true }) { affected_rows }
            unfulfilled: update_participations(where: { id: { _in: $to_false } }, _set: { condition_is_fulfilled: false }) { affected_rows }
        }`,
        { notifications, to_true, to_false }
    );
}

/** One full matcher pass. Returns the number of flips applied. */
export async function run_once() {
    const campaigns = await fetch_campaigns();
    const all_flips = [];
    for (const campaign of campaigns) {
        for (const flip of compute_flips(campaign)) {
            all_flips.push({ campaign, ...flip });
        }
    }
    if (all_flips.length) {
        console.log(`${new Date().toISOString()} flipping ${all_flips.length} participation(s):`);
        for (const f of all_flips) {
            console.log(`  ${f.fulfilled ? '✅' : '↩️'} campaign ${f.campaign.id} "${f.campaign.title}" participation ${f.participation.id} (threshold ${f.participation.threshold})`);
        }
        await apply_flips(all_flips);
    }
    return all_flips.length;
}

/** The polling loop. */
export async function run(interval_seconds) {
    const interval = interval_seconds ?? Number(process.env.MATCHER_INTERVAL_SECONDS || 2);
    console.log(`Matcher polling every ${interval}s against ${GQL}`);
    while (true) {
        try {
            await run_once();
        } catch (e) {
            console.error('matcher pass error:', e.message || e);
            await new Promise(r => setTimeout(r, 20000));
        }
        await new Promise(r => setTimeout(r, interval * 1000));
    }
}
