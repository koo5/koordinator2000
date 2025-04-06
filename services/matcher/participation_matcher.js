var gql = require('graphql-tag');
var db_client = require('./db_client.js');
var moment = require('moment');




var counter = 0;
let verbose = false;
const client = db_client.client();




async function flip_bit(participation, val)
{
    try
    {
        let content;
        if (val)
            content = `Heads up! "${participation.campaign.title}" just reached your defined critical mass of ${participation.threshold}! Start acting now!`;
        else
            content = `Heads up! "${participation.campaign.title}" just un-reached your defined critical mass of ${participation.threshold}! Go back home now, it's pointless!`;

        console.log(await client.mutate({
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

        console.log(await client.mutate({
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

/*
walk the list of participations sorted by threshold. Any participation with threshold < current index is fulfilled.
*/
async function update_participations(data)
{
    for (const campaign of data.campaigns)
    {
        if (verbose)console.log(campaign.id + ' - ' + campaign.title + ':');
        let participation_idx_starting_at_1 = 1;
        let last_fulfilled_idx = -1;
        campaign.participations.forEach((participation) =>
        {
            if (participation.threshold < participation_idx_starting_at_1)
                last_fulfilled_idx = participation_idx_starting_at_1 - 1;
            participation_idx_starting_at_1++;
        });
        let idx = 0;
        let fulfilled = true;
        //campaign.participations.forEach(async (participation) =>
        for (const participation of campaign.participations)
        {
            if (idx > last_fulfilled_idx)
            {
                fulfilled = false;
            }
            if (verbose) console.log(JSON.stringify(participation, null, ''));
            if (participation.condition_is_fulfilled != fulfilled)
            {
                //console.log('flip ' + JSON.stringify(participation, null, '') + '.');
                console.log('FLIP!');
                if (!verbose)console.log(campaign.id + ' - ' + campaign.title + ':');
                if (!verbose)console.log(JSON.stringify(participation, null, ''));
                // only do one at a time for now..
                await flip_bit(participation, fulfilled);
                return
            }
            idx++;
        }
        if (verbose) console.log();
    }

    if (verbose) console.log();
    //console.log(Date.now());
    console.log(moment().format());
    if (verbose) console.log();
}


async function my_fetch()
{
    const { data } = await client.query({
        query: gql`
            query GET_PARTICIPATIONS {
              campaigns(order_by: [{id: asc}]) {
                id
                title
                participations(order_by: [{threshold: asc}], where: {account: {smazano: {_eq: false}}} ) {
                    id
                    account_id
                    campaign_id
                    campaign
                    {
                        title
                    }
                    threshold
                    condition_is_fulfilled
                },
              }
            }
        `,
    });
    return data;
};


export async function run() {
    console.log('running..');
    let sleep = 1;
    try
    {
        let data = await my_fetch();
        await update_participations(data);
        console.log('done.');
    }
    catch (e)
    {
        console.log(e)
        sleep = 20;
    }
    /* just to avoid mem/handle leaks .. should be fixed now */
    // if (--counter == 0)
    //     process.exit(0)
    /* and repeat */
    setTimeout(async () => {await run();}, sleep * 1000);
};

//(async () => {await run()})();



