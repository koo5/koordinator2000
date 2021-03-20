import * as config_file from './config.js';
var config = config_file.config;

import sirv from 'sirv';
import polka from 'polka';

const bodyParser = require('body-parser')
const send = require('@polka/send-type');
import compression from 'compression';
import * as sapper from '@sapper/server';
import SignJWT from 'jose/jwt/sign'
import parseJwk from 'jose/jwk/parse'
/*import decodeProtectedHeader from 'jose/util/decode_protected_header'
import jwtVerify from 'jose/jwt/verify'*/
var moment = require('moment');

const {uniqueNamesGenerator, adjectives, colors, animals} = require('unique-names-generator');


const {PORT, NODE_ENV} = process.env;
const dev = NODE_ENV === 'development';
var {PUBLIC_URL = "http://localhost:3000", MY_APP_KEYS} = config;

var sess = {
	PUBLIC_URL,
	GRAPHQL_ENDPOINT: config.GRAPHQL_ENDPOINT,
	PUBLIC_GRAPHQL_HEADERS: config.PUBLIC_GRAPHQL_HEADERS
};
console.log(sess);

if (MY_APP_KEYS == undefined)
{
	throw("must have keys")
}
const pr = MY_APP_KEYS["private"];
const pu = MY_APP_KEYS["public"];


var ecPrivateKey;
var rsaPublicKey;


async function load_keys()
{
	ecPrivateKey = await parseJwk(pr)
	rsaPublicKey = await parseJwk(pu)
}

(async () =>
{
	await load_keys()
})();


import {new_apollo_client} from 'srcs/apollo.js';
import gql from 'graphql-tag';

const apollo_client = new_apollo_client();


async function free_user_id()
{
	const name = uniqueNamesGenerator({dictionaries: [adjectives, colors]});
	console.log("free_user_id:" + name)
	const result = await apollo_client.mutate({
			mutation: gql`
				mutation MyMutation($name: String) {
				  insert_accounts_one(object: {name: $name}) {
					id
				  }
				}
			`,
			variables:
				{
					name: name
				}
		}
	);
	let r = await sign_user_object(
		{
			id: result['data']['insert_accounts_one']['id'],
			name
		});
	console.log("free_user_id result:" + JSON.stringify(r, null, ' '))
	console.log()
	return r;
}

async function sign_user_object(x)
{
	const jwt = await user_authenticity_jwt(x.id);
	return {...x, jwt};
}

async function user_authenticity_jwt(id)
{
	return await new SignJWT({'urn:id': id})
		.setProtectedHeader({alg: pr.alg})
		.setIssuedAt()
		.setIssuer('urn:example:issuer')
		.setAudience('urn:example:audience')
		.setExpirationTime('2h')
		.sign(ecPrivateKey)
}

async function process_event(x)
{
	let auth0 = x.auth.auth0;
	if (auth0.token == "") return;
	/*console.log("decode:")
	let ph = decodeProtectedHeader(token)
	console.log(ph)*/
	console.log("user is:");
	console.log(JSON.stringify(auth0, null, '  '));
	let user_id = await user_id_from_auth("auth0", auth0.info.sub);
	if (user_id)
		var result = {user: await sign_user_object({id: user_id})};
	else
	{
		user_id = x.id
		save_verified_authentication(x.id, "auth0", auth0.info)
	}
	grab_email(user_id, auth0.info);
	return result
}

async function user_id_from_auth(provider, sub)
{
	var found_user_id = undefined;
	let result = await apollo_client.query({
		query: gql`
				query MyQuery($login_name: String, $provider: String) {
				  verified_user_authentications(where: {login_name: {_eq: $login_name}, provider: {_eq: $provider}}) {
					account_id
				  }
				}
			`,
		variables:
			{
				login_name: sub,
				provider: provider
			}
	});
	await result.data.verified_user_authentications.forEach(async (x) =>
	{
		console.log('found verified_user_authentication:');
		console.log(x);
		found_user_id = found_user_id || x.account_id;
	})
	return found_user_id;
}


async function grab_email(user_id, info)
{
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
		}
	),null,''));
}

async function save_verified_authentication(user_id, provider, info)
{
	if (user_id == -1 || !user_id)
		return;
	let login_name = info.sub;
	console.log(['save_verified_authentication',user_id, provider, login_name]);
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
		}
	);
}

console.log(moment().format());

let app = polka()
app.use(
	bodyParser.json(),
	bodyParser.urlencoded({extended: false}))

	.post('/get_free_user_id', async (req, res) =>
	{
		console.log('/get_free_user_id');
		send(res, 200, await free_user_id());
		console.log(moment().format());
		console.log();
	})
	.post('/event', async (req, res) =>
	{
		console.log('/event:');
		let e = req.body.event;
		//console.log(e);
		let rrr = await process_event(e);
		console.log('/event response:');
		console.log(rrr);
		send(res, 200, rrr);
		console.log(moment().format());
		console.log();
	})
	.use(
		compression({threshold: 0}),
		sirv('static', {dev}),
		sapper.middleware(
			{
				session: () => sess
			})
	)
	.listen(PORT, err =>
	{
		if (err)
			console.log('error', err);
	});
