/**
 * Server-side authentication utilities
 * This file should only be imported by server-side code
 */
import type { KeyLike } from 'jose';
import { importJWK, SignJWT } from 'jose';
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
 * Auth event interface
 */
interface AuthEvent {
    id?: number;
    auth?: {
        keycloak?: {
            token?: string;
            info?: {
                sub: string;
                email?: string;
                [key: string]: any;
            };
        };
    };
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

    const userObject: UserObject = {
        id: result.data.insert_accounts_one.id,
        name: name!,
        email: email,
        autoscroll: true,
    };

    const r = await sign_user_object(userObject);
    console.log('free_user_id result:' + JSON.stringify(r, null, ' '));
    return r;
}

/**
 * Signs a user object by adding a JWT
 * @param userObject - The user object to sign
 * @returns The user object with JWT added
 */
export async function sign_user_object(userObject: UserObject): Promise<UserObject> {
    await init_keys();
    if (!keys_initialized) {
        console.error('Keys not initialized');
    }
    const jwt = await user_authenticity_jwt(userObject.id);
    return { ...userObject, jwt };
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
                'x-hasura-default-role': 'user',    // Define the default role
                'x-hasura-user-id': String(id),     // Pass the user ID as a string
            },
            'urn:id': id, // Keep your internal identifier if needed
        })
            .setProtectedHeader({ alg: server_env.MY_APP_KEYS.private.alg as string })
            .setIssuedAt()
            .setIssuer('urn:example:issuer')
            .setAudience('urn:example:audience')
            .setExpirationTime('2h')
            .sign(ecPrivateKey);
    } catch (error) {
        console.error('JWT generation error:', error);
        throw error; // Re-throw in server context
    }
}

/**
 * Process authentication event from Keycloak
 * This function handles the authentication event from Keycloak and associates
 * the Keycloak identity with our internal JWT identity system
 * @param event - Authentication event data
 * @returns User data if authentication was successful
 */
export async function process_auth_event(event: AuthEvent): Promise<{ user: UserObject } | null> {
    try {
        // Validate the event data structure
        if (!event) {
            console.log('process_auth_event: Event object is null or undefined');
            return null;
        }

        // For debugging
        console.log('process_auth_event received:', JSON.stringify(event, null, 2));

        // If no auth data at all, return null
        if (!event.auth) {
            console.log('process_auth_event: No auth data in event');
            return null;
        }

        // Handle Keycloak auth
        if (event.auth.keycloak) {
            const keycloak = event.auth.keycloak;

            // Skip empty tokens
            if (!keycloak.token) {
                console.log('process_auth_event: Empty Keycloak token');
                return null;
            }

            // Validate required info
            if (!keycloak.info || !keycloak.info.sub) {
                console.log('process_auth_event: Missing Keycloak subject ID');
                return null;
            }

            console.log('Processing Keycloak authentication:', JSON.stringify(keycloak.info, null, 2));

            // Find if this Keycloak identity is already associated with a user
            const user_id = await user_id_from_auth('keycloak', keycloak.info.sub);

            if (user_id) {
                // If found, return the associated user with a fresh JWT
                console.log(`Found existing user (ID: ${user_id}) for Keycloak identity`);
                return { user: await sign_user_object({ id: user_id, name: '' }) };
            } else if (event.id) {
                // If not found but we have a current user ID, associate the identities
                console.log(`Associating Keycloak identity with user ID: ${event.id}`);
                await save_verified_authentication(event.id, 'keycloak', keycloak.info);
                // Save email if available
                if (keycloak.info.email) {
                    await grab_email(event.id, keycloak.info);
                }
                return { user: await sign_user_object({ id: event.id, name: '' }) };
            } else {
                console.log('No valid user ID for Keycloak association');
                return null;
            }
        }

        console.log('No supported auth provider found in event');
        return null;
    } catch (error) {
        console.error('Error in process_auth_event:', error);
        return null;
    }
}

/**
 * Find user ID from authentication provider and subject
 * @param provider - Authentication provider name
 * @param sub - Subject identifier
 * @returns User ID if found
 */
export async function user_id_from_auth(provider: string, sub: string): Promise<number | undefined> {
    let found_user_id: number | undefined = undefined;

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

    if (result.data && 'verified_user_authentications' in result.data) {
        const authData = result.data as { verified_user_authentications: Array<{ account_id: number }> };
        authData.verified_user_authentications.forEach(x => {
            console.log('found verified_user_authentication:');
            console.log(x);
            found_user_id = found_user_id || x.account_id;
        });
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
    if (user_id === -1 || !user_id) return;

    const login_name = info.sub;
    console.log(['save_verified_authentication', user_id, provider, login_name]);

    await mutate(
        gql`
            mutation MyMutation($login_name: String = "", $provider: String = "", $user_id: Int) {
                insert_verified_user_authentications_one(object: { login_name: $login_name, provider: $provider, account_id: $user_id }) {
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
}
