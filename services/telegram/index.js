/**
 * Koordinator Telegram bot.
 *
 * A thin client on the SAME Hasura/Postgres data plane as the webapp. Zero deps:
 * raw Telegram Bot API over fetch, long-polling (no inbound port). Runs on bun.
 * Backend logic lives in koordinator.js (testable without Telegram).
 *
 * Config (env / .env):
 *   TELEGRAM_BOT_TOKEN            - from @BotFather (required)
 *   KOORDINATOR_GRAPHQL_ENDPOINT - default http://127.0.0.1:8080/v1/graphql
 *   HASURA_ADMIN_SECRET          - admin secret for the local Hasura
 */
import {
    get_or_create_account, top_campaigns, find_campaign, pledge, my_pledges,
    pending_telegram_notifications, mark_delivered,
} from './koordinator.js';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
    console.error('Set TELEGRAM_BOT_TOKEN (get one from @BotFather). See .env.example.');
    process.exit(1);
}
const API = `https://api.telegram.org/bot${TOKEN}`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function tg(method, body) {
    const res = await fetch(`${API}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json();
}
const send = (chatId, text) =>
    tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true });

async function handleCommand(msg) {
    const chatId = msg.chat.id;
    const text = msg.text.trim();
    const cmd = text.split(/\s+/)[0].toLowerCase().replace(/@.*$/, '');
    const args = text.slice(cmd.length).trim();

    switch (cmd) {
        case '/start': {
            await get_or_create_account(msg.from); // link this Telegram user to an account
            await send(
                chatId,
                'Welcome to <b>Koordinator</b> — coordinate collective action.\n\n' +
                    'Pledge to act <i>only if enough others do too</i>, and get pinged when your condition is met.\n\n' +
                    '/campaigns — see what people are coordinating on\n' +
                    '/pledge &lt;campaign&gt; &lt;N&gt; — join if N others do\n' +
                    '/me — your pledges'
            );
            break;
        }
        case '/campaigns': {
            const cs = await top_campaigns();
            if (!cs.length) return void send(chatId, 'No campaigns yet.');
            const lines = cs.map(c => `• <b>${esc(c.title)}</b> (#${c.id}) — ${c.participations_aggregate.aggregate.count} in`);
            await send(chatId, 'Top campaigns:\n' + lines.join('\n') + '\n\nPledge with: /pledge &lt;#id or title&gt; &lt;N&gt;');
            break;
        }
        case '/pledge': {
            // /pledge <campaign id or title...> <threshold>
            const m = args.match(/^(.*?)\s+(\d+)$/);
            if (!m) return void send(chatId, 'Usage: /pledge &lt;campaign #id or title&gt; &lt;N&gt;\ne.g. /pledge 11 50');
            const [, term, thresholdStr] = m;
            const campaign = await find_campaign(term.trim());
            if (!campaign) return void send(chatId, `No campaign found for "${esc(term.trim())}". Try /campaigns.`);
            const accountId = await get_or_create_account(msg.from);
            const threshold = parseInt(thresholdStr, 10);
            await pledge(accountId, campaign.id, threshold);
            await send(chatId, `✅ Pledged on <b>${esc(campaign.title)}</b>: you'll join when <b>${threshold}</b> others do.`);
            break;
        }
        case '/me': {
            const accountId = await get_or_create_account(msg.from);
            const ps = await my_pledges(accountId);
            if (!ps.length) return void send(chatId, "You have no pledges yet. Try /campaigns then /pledge.");
            const lines = ps.map(p => `• <b>${esc(p.campaign.title)}</b> (#${p.campaign.id}) — if ${p.threshold} others join`);
            await send(chatId, 'Your pledges:\n' + lines.join('\n'));
            break;
        }
        default:
            await send(chatId, 'Commands: /start, /campaigns, /pledge, /me');
    }
}

async function handleUpdate(update) {
    const msg = update.message;
    if (!msg || typeof msg.text !== 'string') return;
    try {
        await handleCommand(msg);
    } catch (e) {
        console.error('command error:', e);
        await send(msg.chat.id, 'Something went wrong. Please try again.').catch(() => {});
    }
}

// --- Threshold-crossing push: the killer feature -----------------------------
// The matcher inserts a campaign_notifications row when a participation's
// condition flips. We DM Telegram-linked accounts about undelivered ones and
// record delivery in the DB (notification_deliveries) — restart-safe, no state
// file. login_name == the user's Telegram id == their private chat id.
async function notificationLoop() {
    while (true) {
        try {
            const pending = await pending_telegram_notifications();
            const sent = [];
            for (const n of pending) {
                try {
                    await send(n.telegram_id, `🔔 ${esc(n.content)}`);
                    sent.push(n.id);
                } catch (e) {
                    console.error('notify send error:', e); // not marked -> retried next poll
                }
            }
            await mark_delivered(sent);
        } catch (e) {
            console.error('notification poll error:', e);
        }
        await new Promise(r => setTimeout(r, 15000));
    }
}

async function main() {
    const me = await tg('getMe');
    if (!me.ok) {
        console.error('Invalid TELEGRAM_BOT_TOKEN:', me);
        process.exit(1);
    }
    console.log(`Koordinator bot @${me.result.username} up. Long-polling…`);

    notificationLoop(); // run the push loop alongside command polling

    let offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const res = await fetch(`${API}/getUpdates?offset=${offset}&timeout=30`);
            const j = await res.json();
            if (j.ok) {
                for (const u of j.result) {
                    offset = u.update_id + 1;
                    handleUpdate(u);
                }
            }
        } catch (e) {
            console.error('poll error:', e);
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

main();
