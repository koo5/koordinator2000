/**
 * Authentication module for handling JWT operations and user authentication
 */
import { SignJWT, importJWK } from 'jose';
import gql from 'graphql-tag';
import { uniqueNamesGenerator, adjectives, colors } from 'unique-names-generator';
import { new_apollo_client } from '../apollo.js';
import * as config_file from '../config.js';

const config = config_file.config;

// Initialize variables
/** @type {CryptoKey|null} */
let ecPrivateKey = null;
/** @type {CryptoKey|null} */
let rsaPublicKey = null;
/** @type {boolean} */
let keys_initialized = false;
/** @type {Promise<boolean>|null} */
let keys_promise = null;

/**
 * Initialize cryptographic keys for JWT operations
 * 
 * @returns {Promise<void>} Promise that resolves when keys are initialized
 */
export function init_keys() {
  // Only initialize keys once and only in browser environment
  if (!keys_promise && typeof window !== 'undefined') {
    keys_promise = load_keys_internal();
    console.log("Auth keys initialization started");
  }
  return keys_promise || Promise.resolve();
}

/**
 * Internal function to load and import cryptographic keys
 * 
 * @returns {Promise<boolean>} Promise that resolves to true if keys were successfully loaded
 */
async function load_keys_internal() {
  try {
    const { MY_APP_KEYS } = config;
    
    if (!MY_APP_KEYS) {
      console.error("Missing MY_APP_KEYS configuration");
      return false;
    }
    
    const pr = MY_APP_KEYS["private"];
    const pu = MY_APP_KEYS["public"];
    
    if (!pr || !pu) {
      console.error("Missing private or public key in MY_APP_KEYS");
      return false;
    }
    
    ecPrivateKey = await importJWK(pr);
    rsaPublicKey = await importJWK(pu);
    keys_initialized = true;
    return true;
  } catch (error) {
    console.error("Error initializing keys:", error);
    return false;
  }
}

// Lazy load the Apollo client to avoid SSR issues
let _apollo_client;
function get_apollo_client() {
  if (!_apollo_client) {
    _apollo_client = new_apollo_client();
  }
  return _apollo_client;
}

export async function free_user_id(email = null) {
	let result;
	let name;
	while (!result) {
		name = uniqueNamesGenerator({dictionaries: [adjectives, colors]});
		console.log("free_user_id:" + name);
		try {
			// Create account object with name and optional email
			const accountObject = { name };
			if (email) {
				accountObject.email = email;
			}
			
			result = await get_apollo_client().mutate({
				mutation: gql`
					mutation MyMutation($accountObject: accounts_insert_input!) {
						insert_accounts_one(object: $accountObject) {
							id
							email
						}
					}
				`,
				variables: {
					accountObject
				}
			});
		} catch (error) {
			console.error(error);
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	}
	
	// Get the email from the result if it exists
	const resultEmail = result?.data?.insert_accounts_one?.email || email;
	
	let r = await sign_user_object({
		id: result['data']['insert_accounts_one']['id'],
		name,
		email: resultEmail,
		autoscroll: true
	});
	console.log("free_user_id result:" + JSON.stringify(r, null, ' '));
	return r;
}

/**
 * Signs a user object by adding a JWT
 * 
 * @param {UserObject} x - The user object to sign
 * @returns {Promise<UserObject>} The user object with JWT added
 */
export async function sign_user_object(x) {
  await init_keys();
  if (!keys_initialized && typeof window !== 'undefined') {
    console.error("Keys not initialized");
  }
  const jwt = await user_authenticity_jwt(x.id);
  return {...x, jwt};
}

/**
 * Generate a JWT for a user ID
 * 
 * @param {number} id - The user ID to authenticate
 * @returns {Promise<string>} The generated JWT token
 */
export async function user_authenticity_jwt(id) {
  await init_keys();
  if (!keys_initialized && typeof window !== 'undefined') {
    console.error("Keys not initialized");
    return "";
  }
  
  return await new SignJWT({
    'urn:id': id,
  })
    .setProtectedHeader({alg: config.MY_APP_KEYS.private.alg})
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime('2h')
    .sign(ecPrivateKey);
}

export async function process_event(x) {
	let auth0 = x.auth.auth0;
	if (auth0.token == "") return;
	console.log("user is:");
	console.log(JSON.stringify(auth0, null, '  '));
	let user_id = await user_id_from_auth("auth0", auth0.info.sub);
	if (user_id)
		var result = {user: await sign_user_object({id: user_id})};
	else {
		user_id = x.id;
		save_verified_authentication(user_id, "auth0", auth0.info);
	}
	grab_email(user_id, auth0.info);
	return result;
}

export async function user_id_from_auth(provider, sub) {
	var found_user_id = undefined;
	let result = await get_apollo_client().query({
		query: gql`
			query MyQuery($login_name: String, $provider: String) {
				verified_user_authentications(where: {login_name: {_eq: $login_name}, provider: {_eq: $provider}}) {
					account_id
				}
			}
		`,
		variables: {
			login_name: sub,
			provider: provider
		}
	});
	await result.data.verified_user_authentications.forEach(async (x) => {
		console.log('found verified_user_authentication:');
		console.log(x);
		found_user_id = found_user_id || x.account_id;
	});
	return found_user_id;
}

export async function grab_email(user_id, info) {
	if (user_id == -1 || !user_id)
		return;
	let email = info.email;
	console.log(JSON.stringify(await get_apollo_client().mutate({
		mutation: gql`
			mutation MyMutation($user_id: Int, $email: String) {
				update_accounts(where: {id: {_eq: $user_id}, email: {_is_null: true}}, _set: {email: $email})
				{
					returning {
						email
					}
				}
			}`,
		variables: {
			user_id,
			email
		}
	}), null, ''));
}

export async function save_verified_authentication(user_id, provider, info) {
	if (user_id == -1 || !user_id)
		return;
	let login_name = info.sub;
	console.log(['save_verified_authentication', user_id, provider, login_name]);
	await get_apollo_client().mutate({
		mutation: gql`
			mutation MyMutation($login_name: String = "", $provider: String = "", $user_id: Int) {
				insert_verified_user_authentications_one(object: {login_name: $login_name, provider: $provider, account_id: $user_id})
				{
					account_id
				}
			}
		`,
		variables: {
			user_id,
			provider,
			login_name
		}
	});
}
