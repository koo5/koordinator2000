/**
 * Server-side authentication utilities
 * This file should only be imported by server-side code
 */
import type { KeyLike } from 'jose';
import { importJWK, jwtVerify, SignJWT } from 'jose';
import { adjectives, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { getServerClient, gql, serverMutation as mutate, serverQuery as query } from '$lib/server/urql';
import { server_env } from '$lib/server/env';


/**
 * User object interface
 */
interface UserObject {
    id: number;
    name: string;
    email?: string | null;
    autoscroll?: boolean;
    fallback?: boolean;
    jwt?: string;

    [key: string]: any;
}

/**
 * Authentication info interface
 */
interface AuthInfo {
    sub: string;
    email?: string;

    [key: string]: any;
}

/**
 * Authentication query result interface
 */
interface AuthQueryResult {
    data?: {
        verified_user_authentications?: Array<{
            account_id: number;
        }>;
    };
}

/**
 * Account insertion result interface
 */
interface AccountInsertResult {
    data?: {
        insert_accounts_one?: {
            id: number;
            email?: string;
        };
    };
}

// Initialize variables for JWT operations
let ecPrivateKey: KeyLike = null as unknown as KeyLike;
let rsaPublicKey: KeyLike = null as unknown as KeyLike;
let keys_initialized = false;
let keys_promise: Promise<boolean> | null = null;

/**
 * Initialize cryptographic keys for JWT operations
 * @returns Promise that resolves when keys are initialized
 */
export async function init_keys(): Promise<boolean> {
    if (!keys_promise) {
        keys_promise = load_keys_internal();
        console.log('Server auth keys initialization started');
    }
    return keys_promise;
}

/**
 * Internal function to load and import cryptographic keys
 * @returns Promise that resolves to true if keys were successfully loaded
 */
async function load_keys_internal(): Promise<boolean> {
    try {
        // Get server-side keys from environment
        const MY_APP_KEYS = server_env.MY_APP_KEYS;
        if (!MY_APP_KEYS || !MY_APP_KEYS.private || !MY_APP_KEYS.public) {
            throw new Error('Invalid MY_APP_KEYS format');
        }

        const pr = MY_APP_KEYS.private;
        const pu = MY_APP_KEYS.public;

        if (!pr || !pu) {
            console.error('Missing private or public key in MY_APP_KEYS');
            return false;
        }

        ecPrivateKey = (await importJWK(pr)) as KeyLike;
        rsaPublicKey = (await importJWK(pu)) as KeyLike;
        keys_initialized = true;
        console.log('Server-side auth keys initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing keys:', error);
        return false;
    }
}

/**
 * Generate a free user ID with optional email
 * @param email - Optional email for the user
 * @returns User object with JWT
 */
export async function free_user_id(email: string | null = null): Promise<UserObject> {
    let result: { data: any } | null = null;
    let name: string = 'user'; // Default name in case of errors
    let attempt = 0;
    const maxAttempts = 3;

    await init_keys();

    while (!result && attempt < maxAttempts) {
        attempt++;
        name = uniqueNamesGenerator({ dictionaries: [adjectives, colors] });
        console.log(`free_user_id attempt ${attempt}/${maxAttempts}: ${name}`);

        try {
            // Create account object with name and optional email
            const accountObject: { name: string; email?: string } = { name };
            if (email) {
                accountObject.email = email;
            }

            // Use server URQL client for admin access
            const client = getServerClient();
            console.log('Server URQL client initialized:', !!client);
            console.log('GraphQL mutation variables:', { accountObject });

            const mutationResult = await mutate<{ insert_accounts_one?: { id: number; email?: string } }>(
                gql`
                    mutation MyMutation($accountObject: accounts_insert_input!) {
                        insert_accounts_one(object: $accountObject) {
                            id
                            email
                        }
                    }
                `,
                {
                    accountObject,
                }
            );

            result = { data: mutationResult.data };

            console.log('GraphQL mutation result:', JSON.stringify(result, null, 2));

            // Validate the result
            if (!result || !result.data || !result.data.insert_accounts_one) {
                console.error('Invalid GraphQL response - missing insert_accounts_one:', result);
                result = null; // Reset result to retry
            }
        } catch (error) {
            console.error('GraphQL mutation error:', error);
            // Wait only 2 seconds between retries
            await new Promise(resolve => setTimeout(resolve, 2000));
            result = null;
        }
    }

    if (!result || !result.data || !result.data.insert_accounts_one) {
        console.warn('Failed to create user via GraphQL, using fallback user');
    }

    // If we don't have a result, we can't create a user
    if (!result?.data?.insert_accounts_one?.id) {
        throw new Error('Failed to create user: no user ID returned from database');
    }

    // Create a signed user object with the new helper function
    const r = await create_signed_my_user(
        result.data.insert_accounts_one.id,
        name!,
        {
            settings: {
                autoscroll: true
            }
        }
    );

    console.log('free_user_id result:' + JSON.stringify(r, null, ' '));
    return r;
}

/**
 * Signs a user object by adding a JWT
 * @param userObject - The user object to sign
 * @returns The user object with JWT added
 */
export async function sign_user_object(userObject: UserObject): Promise<UserObject> {
    const jwt = await user_authenticity_jwt(userObject.id);
    return { ...userObject, jwt };
}

/**
 * Creates and signs a my_user object in one step
 * @param id - User ID (required)
 * @param name - User name (defaults to empty string)
 * @param extraProps - Additional properties to include
 * @returns A signed user object with JWT ready for client use
 */
export async function create_signed_my_user(
    id: number,
    name: string = '',
    extraProps: Record<string, any> = {}
): Promise<UserObject> {
    // Remove autoscroll from extraProps if present and put it into settings
    const { autoscroll, ...otherProps } = extraProps;

    // Initialize settings object if needed
    const settings: Record<string, any> =
        extraProps.settings ? { ...extraProps.settings } : {};

    // Add autoscroll to settings if provided
    if (autoscroll !== undefined) {
        settings.autoscroll = autoscroll;
    }

    const userObject: UserObject = {
        id,
        name,
        ...otherProps,
        settings
    };

    return await sign_user_object(userObject);
}

/**
 * Generate a JWT for a user ID
 * @param id - The user ID to authenticate
 * @returns The generated JWT token
 */
export async function user_authenticity_jwt(id: number): Promise<string> {
    try {
        await init_keys();

        if (!keys_initialized || !ecPrivateKey) {
            console.error('Keys not initialized for JWT signing');
            return '';
        }

        return await new SignJWT({
            // Include the standard Hasura claims namespace
            'https://hasura.io/jwt/claims': {
                'x-hasura-allowed-roles': ['nobody', 'user'], // Define allowed roles (adjust if needed)
                'x-hasura-default-role': 'nobody',    // Define the default role
                'x-hasura-user-id': String(id),     // Pass the user ID as a string
            },
            'urn:id': id, // Keep your internal identifier if needed
        })
            .setProtectedHeader({ alg: server_env.MY_APP_KEYS.private.alg as string })
            .setIssuedAt()
            .setIssuer('urn:example:issuer')
            .setAudience('urn:example:audience')
            .setExpirationTime('222h')
            .sign(ecPrivateKey);
    } catch (error) {
        console.error('JWT generation error:', error);
        throw error; // Re-throw in server context
    }
}

/**
 * Verify a user JWT's SIGNATURE (not just decode it) and return the account id.
 * Uses the ES256 public key from MY_APP_KEYS. Returns null if invalid/expired.
 * This is the trustworthy check to use before acting on a claimed identity
 * (e.g. linking an OAuth spoke to "the current account").
 */
export async function verify_user_jwt(jwt: string): Promise<number | null> {
    try {
        await init_keys();
        if (!rsaPublicKey) return null;
        const { payload } = await jwtVerify(jwt, rsaPublicKey, {
            issuer: 'urn:example:issuer',
            audience: 'urn:example:audience',
        });
        const id = payload['urn:id'];
        if (typeof id === 'number') return id;
        if (typeof id === 'string' && /^\d+$/.test(id)) return parseInt(id, 10);
        return null;
    } catch {
        return null;
    }
}

/**
 * Sign a stateless magic-link token: a short-lived ES256 JWT carrying the email
 * (and optionally the anonymous account to link to). No DB token table needed —
 * the link is self-verifying. A distinct audience keeps it from being usable as
 * a session token.
 */
export async function sign_magic_link_token(email: string, linkAccountId?: number): Promise<string> {
    await init_keys();
    if (!ecPrivateKey) throw new Error('Keys not initialized for magic-link signing');

    const payload: Record<string, any> = { purpose: 'magic-link', email };
    if (linkAccountId) payload.link_account_id = linkAccountId;

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: server_env.MY_APP_KEYS.private.alg as string })
        .setIssuedAt()
        .setIssuer('urn:example:issuer')
        .setAudience('urn:koordinator:magic-link')
        .setExpirationTime('15m')
        .sign(ecPrivateKey);
}

/** Verify a magic-link token; returns the email (+ optional account to link) or null. */
export async function verify_magic_link_token(token: string): Promise<{ email: string; linkAccountId?: number } | null> {
    try {
        await init_keys();
        if (!rsaPublicKey) return null;
        const { payload } = await jwtVerify(token, rsaPublicKey, {
            issuer: 'urn:example:issuer',
            audience: 'urn:koordinator:magic-link',
        });
        if (payload.purpose !== 'magic-link' || typeof payload.email !== 'string') return null;
        const linkAccountId = typeof payload.link_account_id === 'number' ? payload.link_account_id : undefined;
        return { email: payload.email, linkAccountId };
    } catch {
        return null;
    }
}

/**
 * Turn a verified OAuth-provider identity into a signed session, following the
 * hub-and-spoke model:
 *   1. If the provider identity is already linked -> sign in to that account.
 *   2. Else if we have a verified current (anonymous) account -> attach the
 *      spoke to it (anonymous-first: your pledges carry over).
 *   3. Else -> create a fresh account and attach the spoke.
 */
export async function link_or_create_oauth_account(
    provider: string,
    providerUserId: string,
    email: string | null,
    currentAccountId?: number
): Promise<UserObject> {
    const info: AuthInfo = { sub: providerUserId, email: email ?? undefined };

    const existing = await user_id_from_auth(provider, providerUserId);
    if (existing) {
        return await create_signed_my_user(existing);
    }

    if (currentAccountId && currentAccountId > 0) {
        await save_verified_authentication(currentAccountId, provider, info);
        if (email) await grab_email(currentAccountId, info);
        return await create_signed_my_user(currentAccountId);
    }

    const created = await free_user_id(email);
    await save_verified_authentication(created.id, provider, info);
    return created;
}

/*
 * Multi-provider identity primitives.
 * These operate on the `verified_user_authentications` hub (account_id, provider,
 * login_name) and are provider-agnostic. They are the building blocks for future
 * verification providers; Keycloak was removed, but the hub is retained by design.
 */

/**
 * Find user ID from authentication provider and subject
 * @param provider - Authentication provider name
 * @param sub - Subject identifier
 * @returns User ID if found
 */
export async function user_id_from_auth(provider: string, sub: string): Promise<number | undefined> {
    let found_user_id: number | undefined = undefined;

    console.log(`Looking up user for ${provider} identity with sub: ${sub}`);

    const result = await query<AuthQueryResult>(
        gql`
            query MyQuery($login_name: String, $provider: String) {
                verified_user_authentications(where: { login_name: { _eq: $login_name }, provider: { _eq: $provider } }) {
                    account_id
                }
            }
        `,
        {
            login_name: sub,
            provider: provider,
        }
    );

    // Log the entire query result to debug
    //console.log(`Auth lookup result: ${JSON.stringify(result, null, 2)}`);

    if (result.data && 'verified_user_authentications' in result.data) {
        const authData = result.data as { verified_user_authentications: Array<{ account_id: number }> };

        if (authData.verified_user_authentications.length === 0) {
            console.log(`No ${provider} authentication found for sub: ${sub}`);
        }

        authData.verified_user_authentications.forEach(x => {
            console.log(`Found verified_user_authentication with account_id: ${x.account_id}`);
            found_user_id = found_user_id || x.account_id;
        });
    } else {
        console.log(`No auth data found for ${provider} identity with sub: ${sub}`);
    }

    if (found_user_id) {
        console.log(`Returning existing user ID: ${found_user_id} for ${provider} identity`);
    } else {
        console.log(`No existing user found for ${provider} identity with sub: ${sub}`);
    }

    return found_user_id;
}

/**
 * Add email to user account
 * @param user_id - User ID
 * @param info - Authentication info
 */
export async function grab_email(user_id: number, info: AuthInfo): Promise<void> {
    if (user_id === -1 || !user_id) return;

    const email = info.email;
    if (!email) return;

    const result = await mutate(
        gql`
            mutation MyMutation($user_id: Int, $email: String) {
                update_accounts(where: { id: { _eq: $user_id }, email: { _is_null: true } }, _set: { email: $email }) {
                    returning {
                        email
                    }
                }
            }
        `,
        {
            user_id,
            email,
        }
    );

    console.log(JSON.stringify(result, null, ''));
}

/**
 * Save authentication info
 * @param user_id - User ID
 * @param provider - Authentication provider
 * @param info - Authentication info
 */
export async function save_verified_authentication(user_id: number, provider: string, info: AuthInfo): Promise<void> {
    if (user_id === -1 || !user_id) {
        console.log(`Cannot save authentication for invalid user ID: ${user_id}`);
        return;
    }

    const login_name = info.sub;
    console.log(`Saving ${provider} authentication for user ID: ${user_id} with login_name: ${login_name}`);

    try {
        const result = await mutate(
            gql`
                mutation MyMutation($login_name: String = "", $provider: String = "", $user_id: Int) {
                    insert_verified_user_authentications_one(
                        object: { login_name: $login_name, provider: $provider, account_id: $user_id }
                    ) {
                        account_id
                    }
                }
            `,
            {
                user_id,
                provider,
                login_name,
            }
        );

        if (!result.data?.insert_verified_user_authentications_one?.account_id) {
            console.error(`Failed to save ${provider} authentication: invalid or missing response data`);
            throw new Error('Authentication mutation failed');
        }

        console.log(`Authentication saved successfully: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
        console.error(`Error saving ${provider} authentication for user ID ${user_id}:`, error);
        throw error; // Re-throw to allow proper error handling
    }
}
