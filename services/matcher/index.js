/**
 * Matcher service entry point. Loads env (local ./.env first — docker mounts the
 * root .env there — falling back to the repo root .env for bare-metal runs),
 * then starts the polling loop. Zero dependencies; runs on bun.
 */
import { readFileSync } from 'fs';

function load_env(path) {
    try {
        for (const line of readFileSync(path, 'utf8').split('\n')) {
            const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
            if (m && process.env[m[1]] === undefined) {
                process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
            }
        }
    } catch {
        /* no file — fine */
    }
}

load_env(new URL('./.env', import.meta.url).pathname);
load_env(new URL('../../.env', import.meta.url).pathname);

// Import AFTER env is loaded — the module reads env at import time.
const { run } = await import('./participation_matcher.js');
await run();
