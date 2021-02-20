var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;





let verbose = false;


var fetch = require('cross-fetch');
var gql = require('graphql-tag');
var apollo = require('@apollo/client');

// Create GraphQL Client for FaunaDB, replace HttpLink configuration
// with your own GraphQL endpoint configuration.
const client = new apollo.ApolloClient({
  cache: new apollo.InMemoryCache(),
  link: new apollo.HttpLink({
    uri: 'https://koordinator2.hasura.app/v1/graphql',
    headers: {
      //"Authorization": `Bearer ${process.env.FAUNADB_SECRET}`,
    },
    fetch
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  }
})




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
				  insert_campaign_notifications(objects: {campaign_id: $campaign_id, content: $content, user_id: $user_id}) {
					affected_rows
				  }
				}			
			`,
			variables: {
				user_id: participation.user_id,
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



async function flip_stuff(data)
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
	console.log(Date.now());
	if (verbose) console.log();
}





async function my_fetch()
{
	const { data } = await client.query({
		query: gql`
			query GET_PARTICIPATIONS {
			  campaigns (order_by: [{id: asc}]) {
			  	id
			  	title
				participations(order_by: [{threshold: asc}], where: {user: {smazano: {_eq: false}}} ) {
					id
					user_id
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


async function run() {
	let sleep = 5;
	try
	{
		let data = await my_fetch();
		await flip_stuff(data);
	}
	catch (e)
	{
		console.log(e)
		sleep = 20;
	}
	setTimeout(async () => {await run();}, sleep * 1000);
};

(async () => {await run()})();



/*
var cron = require('node-cron');
cron.schedule('0 * * * * *', function() {
  console.log('You will see this message every minute');
});
//cron.schedule('0,5,10,15,20,25,30,35,40,45,50,55 * * * * *', async function() {

//cron.schedule('0,30 * * * * *', async function() {

cron.schedule('0,15,30,45 * * * * *', run);

(async () => {await run()})();
*/
