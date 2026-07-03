// Derive HASURA_GRAPHQL_JWT_SECRET from the webapp's MY_APP_KEYS (single source
// of truth). Prints one env line. The value is the PUBLIC key only — safe, but
// we keep it in the gitignored .env (not committed) so secret-scanners and
// reviewers don't flag it. Zero deps (bun Web Crypto).
//
//   bun scripts/gen-jwt-secret.mjs            # print the line
//   bun scripts/gen-jwt-secret.mjs >> .env    # (db-init upserts it for you)
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../webapp/.env', import.meta.url), 'utf8');
const m = env.match(/MY_APP_KEYS='(.+)'/);
if (!m) {
    console.error('MY_APP_KEYS not found in webapp/.env');
    process.exit(1);
}
const jwk = { ...JSON.parse(m[1]).public };
delete jwk.alg; // Web Crypto importKey doesn't want the JWS alg here

const key = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
const spki = await crypto.subtle.exportKey('spki', key);
const b64 = Buffer.from(spki).toString('base64');
const pem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

console.log('HASURA_GRAPHQL_JWT_SECRET=' + JSON.stringify({ type: 'ES256', key: pem }));
