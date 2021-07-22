exports.config = {}
if (!process.browser)
{
	var dotenv = require('dotenv')
	var myEnv = dotenv.config()
	var dotenvExpand = require('dotenv-expand')
	dotenvExpand(myEnv)
	exports.config = myEnv.parsed;
}
