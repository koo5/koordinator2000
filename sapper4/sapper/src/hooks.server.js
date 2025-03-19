import * as config_file from './config.js';
import { uniqueNamesGenerator, adjectives, colors } from 'unique-names-generator';
import gql from 'graphql-tag';
import moment from 'moment';
import { SignJWT } from 'jose/jwt/sign';
import parseJwk from 'jose/jwk/parse';
import { new_apollo_client } from './apollo.js';

const config = config_file.config;
const { PUBLIC_URL = "http://localhost:5000", MY_APP_KEYS } = config;

if (MY_APP_KEYS == undefined) {
	throw("must have keys");
}

const pr = MY_APP_KEYS["private"];
const pu = MY_APP_KEYS["public"];

let ecPrivateKey;
let rsaPublicKey;

async function load_keys() {
	ecPrivateKey = await parseJwk(pr);
	rsaPublicKey = await parseJwk(pu);
}

// Load keys immediately
(async () => {
	await load_keys();
})();

const apollo_client = new_apollo_client();

async function free_user_id() {
	let result;
	let name;
	while (!result) {
		name = uniqueNamesGenerator({dictionaries: [adjectives, colors]});
		console.log("free_user_id:" + name);
		try {
			result = await apollo_client.mutate({
				mutation: gql`
					mutation MyMutation($name: String) {
						insert_accounts_one(object: {name: $name}) {
							id
						}
					}
				`,
				variables: {
					name: name
				}
			});
		} catch (error) {
			console.error(error);
			await new Promise(resolve => setTimeout(resolve, 2000));
		}
	}
	let r = await sign_user_object({
		id: result['data']['insert_accounts_one']['id'],
		name,
		autoscroll: true
	});
	console.log("free_user_id result:" + JSON.stringify(r, null, ' '));
	return r;
}

async function sign_user_object(x) {
	const jwt = await user_authenticity_jwt(x.id);
	return {...x, jwt};
}

async function user_authenticity_jwt(id) {
	return await new SignJWT({
		'urn:id': id,
	})
		.setProtectedHeader({alg: pr.alg})
		.setIssuedAt()
		.setIssuer('urn:example:issuer')
		.setAudience('urn:example:audience')
		.setExpirationTime('2h')
		.sign(ecPrivateKey);
}

async function process_event(x) {
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

async function user_id_from_auth(provider, sub) {
	var found_user_id = undefined;
	let result = await apollo_client.query({
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

async function grab_email(user_id, info) {
	if (user_id == -1 || !user_id)
		return;
	let email = info.email;
	console.log(JSON.stringify(await apollo_client.mutate({
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

async function save_verified_authentication(user_id, provider, info) {
	if (user_id == -1 || !user_id)
		return;
	let login_name = info.sub;
	console.log(['save_verified_authentication', user_id, provider, login_name]);
	await apollo_client.mutate({
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

// SvelteKit hooks
export const handle = async ({ event, resolve }) => {
	// Log timestamp for each request
	console.log(moment().format());
	
	// Handle API endpoints
	if (event.url.pathname === '/get_free_user_id' && event.request.method === 'POST') {
		console.log('/get_free_user_id');
		const result = await free_user_id();
		console.log(moment().format());
		console.log();
		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	if (event.url.pathname === '/event' && event.request.method === 'POST') {
		const data = await event.request.json();
		let e = data.event;
		let rrr = await process_event(e);
		console.log('/event response:');
		console.log(rrr);
		console.log(moment().format());
		console.log();
		return new Response(JSON.stringify(rrr), {
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	// Add session data to locals
	event.locals.session = {
		PUBLIC_URL,
		GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT,
		PUBLIC_GRAPHQL_HEADERS: config.PUBLIC_GRAPHQL_HEADERS
	};
	
	return await resolve(event);
};
