exports.config = {}
if (!process.browser)
{
	var dotenv = require('dotenv')
	var myEnv = dotenv.config()
	var dotenvExpand = require('dotenv-expand')
	dotenvExpand(myEnv)
	if (process.env.KOORDINATOR_CONFIG_JSON_TEXT)
	{
		exports.config = JSON.parse(process.env.KOORDINATOR_CONFIG_JSON_TEXT);
	}
	if (myEnv.parsed)
	{
		if (myEnv.parsed.PUBLIC_GRAPHQL_HEADERS)
			exports.config.PUBLIC_GRAPHQL_HEADERS = JSON.parse(myEnv.parsed.PUBLIC_GRAPHQL_HEADERS)
		if (myEnv.parsed.MY_APP_KEYS)
			exports.config.MY_APP_KEYS = JSON.parse(myEnv.parsed.MY_APP_KEYS)
	}
}
