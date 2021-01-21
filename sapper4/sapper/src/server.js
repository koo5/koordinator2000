var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')
var myEnv = dotenv.config()
dotenvExpand(myEnv)
import sirv from 'sirv';
import polka from 'polka';
const send = require('@polka/send-type');
import compression from 'compression';
import * as sapper from '@sapper/server';
//import SignJWT from 'jose/jwt/sign'
//import parseJwk from 'jose/jwk/parse'


const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';
const {PUBLIC_URL="http://localhost:3000"} = process.env;
var sess = {PUBLIC_URL};



/**/

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
	/* almost there!
	we just need to return a jwt instead.g%
	* */
	const id = result['data']['insert_users_one']['id'];
	return {id};
}

/**/

polka()
	.post('/get_free_user_id', async (req, res) => {
	   	send(res, 200, await free_user_id());
	})
	.post('/event', async (req, res) => {
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
