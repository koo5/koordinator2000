var gql = require('graphql-tag');
var db_client = require('./db_client.js')
var moment = require('moment');




var counter = 300;
let verbose = false;


async function do_stuff(data)
{
  let hashtags = [];
  for (const campaign of data.campaigns)
  {
    console.log(JSON.stringify(campaign,null, ' '));
    let tt = campaign.twitter_tag;
    if (tt.length < 3)
      continue;
    hashtags.push(tt);
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



