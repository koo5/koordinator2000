/**
 * Server-only environment configuration
 * This file should never be imported in client-side code
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { public_env, type PublicEnv } from '$lib/public_env';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');
dotenv.config({ path: path.join(rootDir, '.env') });

// Access environment variables from process.env
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || '';
const MY_APP_KEYS = process.env.MY_APP_KEYS || '';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';

/**
 * App keys configuration interface
 */
interface AppKeys {
    private: Record<string, unknown>;
    public: Record<string, unknown>;

    [key: string]: unknown;
}

/**
 * Server environment configuration interface
 */
interface ServerEnv extends PublicEnv {
    HASURA_ADMIN_SECRET: string;
    MY_APP_KEYS: AppKeys;
    KEYCLOAK_CLIENT_SECRET: string;
    PUBLIC_GRAPHQL_HEADERS: Record<string, string>;
}

// Parse JSON configuration for MY_APP_KEYS - this must be provided
let parsedKeys: AppKeys;
try {
    console.log('MY_APP_KEYS env var is:', MY_APP_KEYS.substring(0, 20) + '...');
    
    if (!MY_APP_KEYS) {
        throw new Error('MY_APP_KEYS environment variable is missing');
    }
    const parsed = JSON.parse(MY_APP_KEYS);
    if (!parsed || !parsed.private || !parsed.public) {
        throw new Error('MY_APP_KEYS must contain both private and public key objects');
    }
    parsedKeys = parsed as AppKeys;
} catch (error) {
    console.error('CRITICAL ERROR: Invalid MY_APP_KEYS:', error);
    throw error; // Re-throw to prevent application from starting with invalid keys
}

// Server-side only environment configuration
export const server_env: ServerEnv = {
    // Include public environment variables
    ...public_env,

    // Private environment variables (server-side only)
    HASURA_ADMIN_SECRET,
    MY_APP_KEYS: parsedKeys,
    KEYCLOAK_CLIENT_SECRET: KEYCLOAK_CLIENT_SECRET || '',

    // Override the public GraphQL headers with admin secret for server-side requests
    PUBLIC_GRAPHQL_HEADERS: {
        'content-type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        ...public_env.PUBLIC_GRAPHQL_HEADERS,
    },
};