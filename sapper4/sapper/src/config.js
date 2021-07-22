exports.config = {}
if (!process.browser)
{
	var dotenv = require('dotenv')
	var myEnv = dotenv.config()
	var dotenvExpand = require('dotenv-expand')
	dotenvExpand(myEnv)
	exports.config =
		{
			GRAPHQL_ENDPOINT:"hasura-3f257037.nhost.app/v1/graphql",
			PUBLIC_URL:"http://blissful-nobel-7b9749.netlify.app",
		}
}
