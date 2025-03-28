/**
 * Server-side authentication utilities
 * This file should only be imported by server-side code
 */
import { SignJWT, importJWK } from 'jose';
import { uniqueNamesGenerator, adjectives, colors } from 'unique-names-generator';
import { getServerClient, gql, serverQuery as query, serverMutation as mutate } from '$lib/server/urql.js';
import { server_env } from '$lib/server/env.js';

// Initialize variables for JWT operations
let ecPrivateKey = null;
let rsaPublicKey = null;
let keys_initialized = false;
let keys_promise = null;

/**
 * Initialize cryptographic keys for JWT operations
 * @returns {Promise<void>} Promise that resolves when keys are initialized
 */
export async function init_keys() {
  if (!keys_promise) {
    keys_promise = load_keys_internal();
    console.log("Server auth keys initialization started");
  }
  return keys_promise;
}

/**
 * Internal function to load and import cryptographic keys
 * @returns {Promise<boolean>} Promise that resolves to true if keys were successfully loaded
 */
async function load_keys_internal() {
  try {
    // Get server-side keys from environment
    const MY_APP_KEYS = server_env.MY_APP_KEYS;
    if (!MY_APP_KEYS || !MY_APP_KEYS.private || !MY_APP_KEYS.public) {
      throw new Error("Invalid MY_APP_KEYS format");
    }
    
    const pr = MY_APP_KEYS.private;
    const pu = MY_APP_KEYS.public;
    
    if (!pr || !pu) {
      console.error("Missing private or public key in MY_APP_KEYS");
      return false;
    }
    
    ecPrivateKey = await importJWK(pr);
    rsaPublicKey = await importJWK(pu);
    keys_initialized = true;
    console.log('Server-side auth keys initialized successfully');
    return true;
  } catch (error) {
    console.error("Error initializing keys:", error);
    return false;
  }
}

/**
 * Generate a free user ID with optional email
 * @param {string|null} email - Optional email for the user
 * @returns {Promise<Object>} User object with JWT
 */
export async function free_user_id(email = null) {
  let result;
  let name;
  let attempt = 0;
  const maxAttempts = 3;
  
  await init_keys();
  
  while (!result && attempt < maxAttempts) {
    attempt++;
    name = uniqueNamesGenerator({dictionaries: [adjectives, colors]});
    console.log(`free_user_id attempt ${attempt}/${maxAttempts}: ${name}`);
    
    try {
      // Create account object with name and optional email
      const accountObject = { name };
      if (email) {
        accountObject.email = email;
      }
      
      // Use server URQL client for admin access
      const client = getServerClient();
      console.log("Server URQL client initialized:", !!client);
      console.log("GraphQL mutation variables:", { accountObject });
      
      const mutationResult = await mutate(
        gql`
          mutation MyMutation($accountObject: accounts_insert_input!) {
            insert_accounts_one(object: $accountObject) {
              id
              email
            }
          }
        `,
        {
          accountObject
        }
      );
      
      result = { data: mutationResult.data };
      
      console.log("GraphQL mutation result:", JSON.stringify(result, null, 2));
      
      // Validate the result
      if (!result || !result.data || !result.data.insert_accounts_one) {
        console.error("Invalid GraphQL response - missing insert_accounts_one:", result);
        result = null; // Reset result to retry
        continue;
      }
    } catch (error) {
      console.error("GraphQL mutation error:", error);
      // Wait only 2 seconds between retries 
      await new Promise(resolve => setTimeout(resolve, 2000));
      result = null;
    }
  }
  
  // If we couldn't create a user after max attempts, create a fallback user
  if (!result || !result.data || !result.data.insert_accounts_one) {
    console.warn("Failed to create user via GraphQL, using fallback user");
    // Return a fallback user with a generated ID
    const fallbackId = Math.floor(Math.random() * 100000);
    return await sign_user_object({
      id: fallbackId,
      name: name || "fallback_user",
      email: email,
      autoscroll: true,
      fallback: true
    });
  }

  let r = await sign_user_object({
    id: result.data.insert_accounts_one.id,
    name,
    email: email,
    autoscroll: true
  });
  console.log("free_user_id result:" + JSON.stringify(r, null, ' '));
  return r;
}

/**
 * Signs a user object by adding a JWT
 * @param {Object} x - The user object to sign
 * @returns {Promise<Object>} The user object with JWT added
 */
export async function sign_user_object(x) {
  await init_keys();
  if (!keys_initialized) {
    console.error("Keys not initialized");
  }
  const jwt = await user_authenticity_jwt(x.id);
  return {...x, jwt};
}

/**
 * Generate a JWT for a user ID
 * @param {number} id - The user ID to authenticate
 * @returns {Promise<string>} The generated JWT token
 */
export async function user_authenticity_jwt(id) {
  try {
    await init_keys();
    
    if (!keys_initialized) {
      console.error("Keys not initialized for JWT signing");
      return "";
    }
    
    return await new SignJWT({
      'urn:id': id,
    })
      .setProtectedHeader({alg: server_env.MY_APP_KEYS.private.alg})
      .setIssuedAt()
      .setIssuer('urn:example:issuer')
      .setAudience('urn:example:audience')
      .setExpirationTime('2h')
      .sign(ecPrivateKey);
  } catch (error) {
    console.error("JWT generation error:", error);
    throw error; // Re-throw in server context
  }
}

/**
 * Process authentication event from Keycloak
 * This function handles the authentication event from Keycloak and associates
 * the Keycloak identity with our internal JWT identity system
 */
export async function process_event(x) {
  try {
    // Validate the event data structure
    if (!x) {
      console.log("process_event: Event object is null or undefined");
      return null;
    }
    
    // For debugging
    console.log("process_event received:", JSON.stringify(x, null, 2));
    
    // If no auth data at all, return null
    if (!x.auth) {
      console.log("process_event: No auth data in event");
      return null;
    }
    
    // Handle Keycloak auth
    if (x.auth.keycloak) {
      const keycloak = x.auth.keycloak;
      
      // Skip empty tokens
      if (!keycloak.token) {
        console.log("process_event: Empty Keycloak token");
        return null;
      }
      
      // Validate required info
      if (!keycloak.info || !keycloak.info.sub) {
        console.log("process_event: Missing Keycloak subject ID");
        return null;
      }
      
      console.log("Processing Keycloak authentication:", JSON.stringify(keycloak.info, null, 2));
      
      // Find if this Keycloak identity is already associated with a user
      const user_id = await user_id_from_auth("keycloak", keycloak.info.sub);
      
      if (user_id) {
        // If found, return the associated user with a fresh JWT
        console.log(`Found existing user (ID: ${user_id}) for Keycloak identity`);
        return {user: await sign_user_object({id: user_id})};
      } else if (x.id) {
        // If not found but we have a current user ID, associate the identities
        console.log(`Associating Keycloak identity with user ID: ${x.id}`);
        await save_verified_authentication(x.id, "keycloak", keycloak.info);
        // Save email if available
        if (keycloak.info.email) {
          await grab_email(x.id, keycloak.info);
        }
        return {user: await sign_user_object({id: x.id})};
      } else {
        console.log("No valid user ID for Keycloak association");
        return null;
      }
    }
    
    // Check for legacy auth0 data (temporary, will be removed)
    // This is just to prevent errors during transition
    if (x.auth.auth0) {
      console.log("Legacy Auth0 authentication received - ignoring");
      // Return the current user ID if available
      return x.id ? {user: await sign_user_object({id: x.id})} : null;
    }
    
    // If we get here, no supported auth provider was found
    console.log("No supported auth provider found in event");
    return null;
  } catch (error) {
    console.error("Error in process_event:", error);
    return null;
  }
}

/**
 * Find user ID from authentication provider and subject
 */
export async function user_id_from_auth(provider, sub) {
  var found_user_id = undefined;
  let result = await query(
    gql`
      query MyQuery($login_name: String, $provider: String) {
        verified_user_authentications(where: {login_name: {_eq: $login_name}, provider: {_eq: $provider}}) {
          account_id
        }
      }
    `,
    {
      login_name: sub,
      provider: provider
    }
  );
  
  if (result.data && result.data.verified_user_authentications) {
    await result.data.verified_user_authentications.forEach(async (x) => {
      console.log('found verified_user_authentication:');
      console.log(x);
      found_user_id = found_user_id || x.account_id;
    });
  }
  
  return found_user_id;
}

/**
 * Add email to user account
 */
export async function grab_email(user_id, info) {
  if (user_id == -1 || !user_id)
    return;
  let email = info.email;
  
  const result = await mutate(
    gql`
      mutation MyMutation($user_id: Int, $email: String) {
        update_accounts(where: {id: {_eq: $user_id}, email: {_is_null: true}}, _set: {email: $email})
        {
          returning {
            email
          }
        }
      }`,
    {
      user_id,
      email
    }
  );
  
  console.log(JSON.stringify(result, null, ''));
}

/**
 * Save authentication info
 */
export async function save_verified_authentication(user_id, provider, info) {
  if (user_id == -1 || !user_id)
    return;
  let login_name = info.sub;
  console.log(['save_verified_authentication', user_id, provider, login_name]);
  
  await mutate(
    gql`
      mutation MyMutation($login_name: String = "", $provider: String = "", $user_id: Int) {
        insert_verified_user_authentications_one(object: {login_name: $login_name, provider: $provider, account_id: $user_id})
        {
          account_id
        }
      }
    `,
    {
      user_id,
      provider,
      login_name
    }
  );
}
