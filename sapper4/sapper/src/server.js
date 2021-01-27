var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')
var myEnv = dotenv.config()
dotenvExpand(myEnv)
import sirv from 'sirv';
import polka from 'polka';
const send = require('@polka/send-type');
import compression from 'compression';
import * as sapper from '@sapper/server';
import SignJWT from 'jose/jwt/sign'
import parseJwk from 'jose/jwk/parse'
const bodyParser = require('body-parser')

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
var {PUBLIC_URL="http://localhost:3000", MY_APP_KEYS} = myEnv.parsed;
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
(async () => {await load_keys()})();


import { new_apollo_client } from 'srcs/apollo.js';
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
	const id = result['data']['insert_users_one']['id'];


	const jwt = await new SignJWT({ 'urn:id': id })
	  .setProtectedHeader({ alg:pr.alg })
	  .setIssuedAt()
	  .setIssuer('urn:example:issuer')
	  .setAudience('urn:example:audience')
	  .setExpirationTime('2h')
	  .sign(ecPrivateKey)


	return {id, jwt, auth_debug: true };
}


let app = polka()
	app.use(
		bodyParser.json(),
		bodyParser.urlencoded({ extended: false }));
 app.post('/get_free_user_id', async (req, res) => {
	   	send(res, 200, await free_user_id());
	})
	.post('/event', async (req, res) => {
		console.log(req.body);
	   	send(res, 200, {"okie":"dokie"});
	})
    .use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware(
			{
				session: () => sess
			})
	)
    .listen(PORT, err => {
		if (err)
			console.log('error', err);
    });
