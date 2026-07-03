/**
 * Koordinator Telegram bot — skeleton.
 *
 * A thin client on the SAME Hasura/Postgres data plane the webapp uses. Zero
 * dependencies: raw Telegram Bot API over fetch, long-polling (no inbound port
 * to expose). Runs on bun.
 *
 * Config (env / .env):
 *   TELEGRAM_BOT_TOKEN            - from @BotFather (required)
 *   KOORDINATOR_GRAPHQL_ENDPOINT - default http://127.0.0.1:8080/v1/graphql
 *   HASURA_ADMIN_SECRET          - admin secret for the local Hasura
 *
 * Implemented: /start, /campaigns. Next: account linking (telegram id ->
 * verified_user_authentications spoke), /pledge, and threshold-crossing pushes
 * driven by the matcher. See README.md.
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GQL = process.env.KOORDINATOR_GRAPHQL_ENDPOINT || 'http://127.0.0.1:8080/v1/graphql';
const ADMIN = process.env.HASURA_ADMIN_SECRET || '';

if (!TOKEN) {
    console.error('Set TELEGRAM_BOT_TOKEN (get one from @BotFather). See .env.example.');
    process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function tg(method, body) {
    const res = await fetch(`${API}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}

async function gql(query, variables) {
    const res = await fetch(GQL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(ADMIN ? { 'x-hasura-admin-secret': ADMIN } : {}) },
        body: JSON.stringify({ query, variables }),
    });
    const j = await res.json();
    if (j.errors) throw new Error(JSON.stringify(j.errors));
    return j.data;
}

const sendMessage = (chatId, text) =>
    tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true });

async function topCampaigns(limit = 5) {
    const data = await gql(
        `query TopCampaigns($limit: Int!) {
            campaigns(
                where: { smazano: { _eq: false }, stealth: { _eq: false } }
                order_by: { participations_aggregate: { count: desc } }
                limit: $limit
            ) {
                id
                title
                participations_aggregate(where: { account: { smazano: { _eq: false } } }) {
                    aggregate { count }
                }
            }
        }`,
        { limit }
    );
    return data.campaigns;
}

async function handleCommand(chatId, text) {
    const cmd = text.split(/\s+/)[0].toLowerCase().replace(/@.*$/, '');
    switch (cmd) {
        case '/start':
            await sendMessage(
                chatId,
                'Welcome to <b>Koordinator</b> — coordinate collective action.\n\n' +
                    'Pledge to act <i>only if enough others do too</i>, and get pinged the moment your condition is met.\n\n' +
                    'Try /campaigns to see what people are coordinating on.'
            );
            break;
        case '/campaigns': {
            const cs = await topCampaigns();
            if (!cs.length) {
                await sendMessage(chatId, 'No campaigns yet.');
                break;
            }
            const lines = cs.map(
                c => `• <b>${escapeHtml(c.title)}</b> — ${c.participations_aggregate.aggregate.count} in`
            );
            await sendMessage(chatId, 'Top campaigns:\n' + lines.join('\n'));
            break;
        }
        case '/pledge':
            await sendMessage(chatId, "Pledging from Telegram is coming soon. For now, pledge on the web app.");
            break;
        default:
            await sendMessage(chatId, 'Commands: /start, /campaigns, /pledge');
    }
}

async function handleUpdate(update) {
    const msg = update.message;
    if (!msg || typeof msg.text !== 'string') return;
    await handleCommand(msg.chat.id, msg.text.trim());
}

async function main() {
    const me = await tg('getMe');
    if (!me.ok) {
        console.error('Invalid TELEGRAM_BOT_TOKEN:', me);
        process.exit(1);
    }
    console.log(`Koordinator bot @${me.result.username} up. GraphQL: ${GQL}. Long-polling…`);

    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
            const j = await res.json();
            if (j.ok) {
                for (const u of j.result) {
                    offset = u.update_id + 1;
                    handleUpdate(u).catch(e => console.error('handleUpdate error:', e));
                }
            }
        } catch (e) {
            console.error('poll error:', e);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

main();
