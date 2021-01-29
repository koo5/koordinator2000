var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')
var myEnv = dotenv.config()
dotenvExpand(myEnv)
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


const {PORT, NODE_ENV} = process.env;
const dev = NODE_ENV === 'development';
var {PUBLIC_URL = "http://localhost:3000", MY_APP_KEYS} = myEnv.parsed;
MY_APP_KEYS = JSON.parse(MY_APP_KEYS);
var sess = {PUBLIC_URL};

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
	const result = await apollo_client.mutate({
			mutation: gql`
				mutation MyMutation {
					insert_users_one(object: {}) {
						id
					}
				}
			`
		}
	);
	return await user_object(result['data']['insert_users_one']['id']);
}

async function user_object(id)
{
	const jwt = await user_authenticity_jwt(id);
	return {id, jwt};
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

async function event(x)
{
	if (x.id == -1 || !x.id)
		return;
	let auth0 = x.auth.auth0;
	if (auth0.token == "") return;
	/*console.log("decode:")
	let ph = decodeProtectedHeader(token)
	console.log(ph)*/
	console.log("user is:");
	console.log(auth0.info.sub);
	let found_user_id = await user_id_from_auth("auth0", auth0.info.sub);
	console.log("found_user_id:")
	console.log(found_user_id)
	if (found_user_id)
		return {user: await user_object(found_user_id)};
	else
		save_verified_authentication(x.id, "auth0", auth0.info.sub)
}

async function user_id_from_auth(provider, sub)
{
	var found_user_id = undefined;
	let result = await apollo_client.query({
		query: gql`
				query MyQuery($login_name: String, $provider: String) {
				  verified_user_authentications(where: {login_name: {_eq: $login_name}, provider: {_eq: $provider}}) {
					user_id
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
		console.log('x:');
		console.log(x);
		found_user_id = x.user_id;
	})
	return found_user_id;
}


async function save_verified_authentication(user_id, provider, login_name)
{
	return await apollo_client.mutate({
			mutation: gql`
				mutation MyMutation($login_name: String = "", $provider: String = "", $user_id: Int = 10) {
				  insert_verified_user_authentications_one(object: {login_name: $login_name, provider: $provider, user_id: $user_id})
				  {
					user_id
				  }
				}
		`,
			variables: {
				user_id: x.id,
				provider: "auth0",
				login_name: auth0.info.sub
			}
		}
	);
}

let app = polka()
app.use(
	bodyParser.json(),
	bodyParser.urlencoded({extended: false}))

	.post('/get_free_user_id', async (req, res) =>
	{
		send(res, 200, await free_user_id());
	})
	.post('/event', async (req, res) =>
	{
		/*console.log(req.body);
		console.log(typeof req.body);
		console.log(typeof req.body.event);*/
		let rrr = await event(req.body.event);
		console.log('rrr:');
		console.log(rrr);
		if (rrr)
			rrr["banana"] = true;
		send(res, 200, rrr);
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
