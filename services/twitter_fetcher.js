var gql = require('graphql-tag');
var db_client = require('./db_client.js')
var moment = require('moment');




var counter = 300;
let verbose = false;




/*
async function update_db(participation, val)
{
	try
	{
		let content;
		if (val)
			content = `Heads up! "${participation.campaign.title}" just reached your defined critical mass of ${participation.threshold}! Start acting now!`;
		else
			content = `Heads up! "${participation.campaign.title}" just un-reached your defined critical mass of ${participation.threshold}! Go back home now, it's pointless!`;

		console.log(await db_client.mutate({
			mutation: gql`
				mutation MyMutation($user_id: Int, $content: String, $campaign_id: Int) {
				  insert_campaign_notifications(objects: {campaign_id: $campaign_id, content: $content, account_id: $user_id}) {
					affected_rows
				  }
				}
			`,
			variables: {
				user_id: participation.account_id,
				campaign_id: participation.campaign_id,
				content: content
			}
		}));

		console.log(await db_client.mutate({
			mutation: gql`
				mutation MyMutation($_id: Int, $condition_is_fulfilled: Boolean) {
				  update_participations(where: {id: {_eq: $_id}}, _set: {condition_is_fulfilled: $condition_is_fulfilled}){
					affected_rows
				  }
				}
			`,
			variables: {
				_id: participation.id,
				condition_is_fulfilled: val
			}
		}));
	} catch (e)
	{
		console.log(e)
	}
}
*/

async function do_stuff(data)
{
	for (const campaign of data.campaigns)
	{
		console.log(JSON.stringify(campaign,null, ' '));
		let tt = campaign.twitter_tag;
		if (tt.length < 3)
			continue;
		if (verbose) console.log();
	}

	if (verbose) console.log();
	console.log(moment().format());
	if (verbose) console.log();
}


async function fetch_campaign_data()
{
	const { data } = await db_client.query({
		query: gql`
			query 
			{
				  campaigns(where: {twitter_tag: {_is_null: false}}) 
				  {
				    id
					twitter_tag
				  }
			}
		`,
	});
	return data;
};


async function run() {
	let sleep = 1;
	try
	{
		let data = await fetch_campaign_data();
		await do_stuff(data);
	}
	catch (e)
	{
		console.log(e)
		sleep = 20;
	}
	/* just to avoid mem/handle leaks .. should be fixed now */
	if (counter-- == 0)
		process.exit(0)
	/* and repeat */
	setTimeout(async () => {await run();}, sleep * 100000);
};

(async () => {await run()})();



