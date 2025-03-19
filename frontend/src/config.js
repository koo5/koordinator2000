exports.config = {}
if (!process.browser)
{
	var dotenv = require('dotenv')
	var myEnv = dotenv.config()
	var dotenvExpand = require('dotenv-expand')
	dotenvExpand(myEnv)
	myEnv.parsed.PUBLIC_GRAPHQL_HEADERS = JSON.parse(myEnv.parsed.PUBLIC_GRAPHQL_HEADERS)
	myEnv.parsed.MY_APP_KEYS = JSON.parse(myEnv.parsed.MY_APP_KEYS)
	exports.config = myEnv.parsed;
}
