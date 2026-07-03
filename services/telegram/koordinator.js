/**
 * Koordinator backend calls for the Telegram bot. No Telegram here — pure
 * Hasura, so it's testable on its own. The bot is server-side and uses the
 * admin secret; a Telegram identity becomes a `verified_user_authentications`
 * spoke (provider 'telegram'), mirroring the webapp's anonymous-first model.
 */
const GQL = process.env.KOORDINATOR_GRAPHQL_ENDPOINT || 'http://127.0.0.1:8080/v1/graphql';
const ADMIN = process.env.HASURA_ADMIN_SECRET || '';
const PROVIDER = 'telegram';

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

/**
 * Map a Telegram user to a Koordinator account, creating it (+ the telegram
 * spoke) on first contact. Idempotent: same tg id always resolves to the same
 * account.
 */
export async function get_or_create_account(tgUser) {
    const sub = String(tgUser.id);

    const found = await gql(
        `query($p:String!,$l:String!){ verified_user_authentications(where:{provider:{_eq:$p},login_name:{_eq:$l}}){account_id} }`,
        { p: PROVIDER, l: sub }
    );
    if (found.verified_user_authentications.length) {
        return found.verified_user_authentications[0].account_id;
    }

    const name = tgUser.username || tgUser.first_name || `tg_${sub}`;
    const created = await gql(`mutation($n:String){ insert_accounts_one(object:{name:$n}){id} }`, { n: name });
    const id = created.insert_accounts_one.id;

    await gql(
        `mutation($a:Int!,$p:String!,$l:String!){ insert_verified_user_authentications_one(object:{account_id:$a,provider:$p,login_name:$l}){account_id} }`,
        { a: id, p: PROVIDER, l: sub }
    );
    return id;
}

export async function top_campaigns(limit = 5) {
    const data = await gql(
        `query($limit:Int!){
            campaigns(where:{smazano:{_eq:false},stealth:{_eq:false}}, order_by:{participations_aggregate:{count:desc}}, limit:$limit){
                id title
                participations_aggregate(where:{account:{smazano:{_eq:false}}}){ aggregate{ count } }
            }
        }`,
        { limit }
    );
    return data.campaigns;
}

/** Resolve a campaign by numeric id or a fuzzy title match. */
export async function find_campaign(term) {
    if (/^\d+$/.test(term)) {
        const d = await gql(`query($id:Int!){ campaigns_by_pk(id:$id){ id title } }`, { id: Number(term) });
        return d.campaigns_by_pk;
    }
    const d = await gql(
        `query($t:String!){ campaigns(where:{smazano:{_eq:false},stealth:{_eq:false},title:{_ilike:$t}}, limit:1){ id title } }`,
        { t: `%${term}%` }
    );
    return d.campaigns[0] || null;
}

/** "I'll join if `threshold` others do." Upserts the participation. */
export async function pledge(accountId, campaignId, threshold) {
    await gql(
        `mutation($a:Int!,$c:Int!,$t:Int!){
            insert_participations(objects:{account_id:$a,campaign_id:$c,threshold:$t},
                on_conflict:{constraint:participations_campaign_id_user_id, update_columns:threshold}){ affected_rows }
        }`,
        { a: accountId, c: campaignId, t: threshold }
    );
}

/**
 * Notifications (the matcher writes one on every threshold flip) for Telegram-
 * linked accounts that have NOT yet been delivered over telegram. Delivery is
 * tracked in the notification_deliveries table (durable, per-notification), so
 * this is restart-safe and idempotent — no watermark file. Independent of the
 * webapp's `read` flag.
 */
export async function pending_telegram_notifications() {
    const d = await gql(
        `query {
            campaign_notifications(
                where: {
                    account: { verified_user_authentications: { provider: {_eq:"telegram"} } }
                    _not: { notification_deliveries: { channel: {_eq:"telegram"} } }
                }
                order_by: { id: asc }
                limit: 100
            ) {
                id
                content
                account { verified_user_authentications(where:{provider:{_eq:"telegram"}}){ login_name } }
            }
        }`
    );
    return d.campaign_notifications
        .map(n => ({ id: n.id, content: n.content, telegram_id: n.account?.verified_user_authentications?.[0]?.login_name }))
        .filter(n => n.telegram_id);
}

/** Mark notifications as delivered over a channel (default telegram). Only call
 * for ones actually sent, so failures are retried on the next poll. */
export async function mark_delivered(notificationIds, channel = 'telegram') {
    if (!notificationIds.length) return;
    const objects = notificationIds.map(id => ({ notification_id: id, channel }));
    await gql(
        `mutation($objects:[notification_deliveries_insert_input!]!){
            insert_notification_deliveries(objects:$objects, on_conflict:{constraint:notification_deliveries_pkey, update_columns:[]}){ affected_rows }
        }`,
        { objects }
    );
}

export async function my_pledges(accountId) {
    const d = await gql(
        `query($a:Int!){ participations(where:{account_id:{_eq:$a}}, order_by:{threshold:asc}){ threshold campaign{ id title } } }`,
        { a: accountId }
    );
    return d.participations;
}
