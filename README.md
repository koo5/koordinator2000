# What?

dev version/demo: https://fullcracy.xyz

readme: https://github.com/koo5/koordinator2000/

It's like kickstarter, but not for collecting money, rather it's for coordinating collective actions, like boycotting/supporting companies or pressuring governments. Actions that only make sense if a critical mass of people is ensured.

## Politics

For example, you would vote for a tiny progressive political party, if you knew that your vote would matter. You will probably waste your vote, unless you can know that there is a large enough mass of people to make it count. In some places, this is ensured by the voting system. In others, you have to coordinate with other voters yourself. 

## Consumers

The same principle applies to influencing commercial entities by boycotts and support campaigns. If you are alone in choosig to buy the more ethical brand every time, because everyone thinks they are alone in it, you'll soon be out of money, and the less ethical brand will still be going strong, but if enough people focus on the same issue at the same time, changes will happen. This is usually only achieved in extraordinary situations, with a lot of noise, but the year is 2020, almost everyone is on-line, and we can make highly coordinated consumer habit changes the norm.

## Companies

The same issue is percieved by companies. If there isn't a long-term pressure from customers to change, then, for example, choosing a more ethical supplier and raising prices only means losing money while another company takes its place. A company can start it's own campaign to coordinate with other companies, or it can be influenced by positive or nagative campaigns. Campaigns should have discernible goals. Public pressure can stop when a goal is reached. Stop buying products of X until X changes a particular practice, supplier, etc, or promise to start buying products of X when X changes.

## Campaigns

Express your support for campaigns(actions). Participation costs you money or time, so express under what conditions you are willing to invest it. For example, i will only switch to the more expensive, more ethical brand if 10000 other people do. This site's goal is to let you express it in a way that computers can understand it, so you can be automatically informed when your conditions are satisfied. Track progress, evaluate outcomes, build trust, and repeat.

## How to reach critical mass

### 1
First, the website has to be finished and polished. And ideally a mobile app too. 
### 2
Some worthwhile campaigns should be collected, as examples, to give people reason to click around and share.
### 3
A real-world (or virtual-world cause that has already reached a critical mass of supporters has to be identified. Something that would benefit from additional coordination. An example from Czech Republic is the 2019 event of 250 000 people gathering to protest against prime minister Babiš, and to block the many products of His Agrofert holding. A reasonably sized effort also happened outside of streets and social media, for example a chrome extension that helps online shoppers avoid Agrofert's products. Eventually the momentum all but died out, without effect. I postulate that things would have evolved differently if each of those 250 000 people that gathered would be introduced to the application and encouraged to coordinate through it. I postulate that the biggest obstacle to an individual's effort is this lack of confidence in other's sustained effort, and by extension, each of us includes this shared lack of confidence in our calculations.

## extensibility, decentralization

If you are tech-saavy, you are encouraged to try to:
*  publish your own statements of participation
(todo: link to the ontology, to some generator, to the relevant page on our site, etc)

* extend the data scheme of participation conditions
currently, the only method of specifying your conditions is the "number of others willing to participate" (todo: fill in the actual rdf predicate name), which more precisely means: "number of others whose number of others willing to participate has been reached". And these "others", precisely, are other users who expressed their identify by logging into this website with their google/facebook/etc account. 

	condition := condition or condition
	condition := condition and condition
	condition := number of participants
	condition := number of confirmed participants
	condition := number of estimated participants
*...

At some point, a need may arise to have somebody:
* estimate how many of these accounts belong to real people
* estimate how many people are already commited and participating outside of this platform
* expressed their intent to participate through other similar platforms
etc.


We could already start communicating in a fully decentralized fashion, even, let's say, abstracting away the semi-centralized physical nature of the internet with things like IPFS. But that's not the point here. But: Participations, Conditions and Users - we can build the initial version with just the simplest structures and mechanics, ie, just "Participation upon notice", no confirmations, User objects corresponding to signed-up users, but: "praticipation after confirmation" will be useful to express campaigns that require exact time/space coordination, for example, organizing an online flashmob. The idea of what constitutes an individual will likewise require extending over time, especially if we ever need to handle spam or to handle attempts to skew our estimates / mess with campaigns. So: this should be open protocol. I want an easily extensible UI, so we can quickly experiment with different data structures. If you want to do something different with data from "our" users, you should be able to, if the users consent. All these issues are the focus of https://solidproject.org/

"""People can express trust boundaries in shapes such that apps and query engines receive boundaries of which sources to trust for what information. By default, this might just be the user’s pod. Others’ pods might be consulted for their personal information, such as name, location, birth date, but not for things such as preferences, annotations, etc. Such limits will affect both performance and trust positively, at the cost of perhaps missing some results that might still be trustworthy, but were not part of the shape. In any case, documenting the provenance of query results and their individual components remains important in decentralized networks.""" - https://ruben.verborgh.org/blog/2019/06/17/shaping-linked-data-apps/

"""dokieli implements the W3C Web Annotation specifications Wherever your article is published, readers can leave annotations and replies if they have their own personal datastore to save them to. If your article is published on a personal storage space, you can offer to store annotations and replies on their behalf, and enable anonymous responses too. """ - https://dokie.li/


### "number of participants":
	```
	total number of participants whose "number of participants" have been met.
	determined by:
		given a list of thresholds
		sort the list from lowest to highest
		for idx starting with len(list) - 1 and ending at 0:
			threshold = list[idx]
			#number of other supporters is the count of remaining items whose threshold <= threshold
			num_supporters = 0
			for idx2 starting with len(list) - 2 and ending at 0:
				if list[idx2] <= threshold:
					num_supporters += 1
			if num_supporters >= threshold:
				return idx
	```
			
### "number of confirmed participants":
	```
	given a list of participation statements:
		if confirmed is true:
			sum += 1
	if sum >= threshold:
		alert user, ask for confirmation of participation, set confirmed to true
	```
		

### "number of estimated participants":
	```
	estimation would initially be in hands of the user that created the campaign
	```

## the data schema/ontology in detail
Location:
	a string or an uri or possibly some api-specific identifier
	not sure if there is any free ontology or service we can use to autocomplete and disambiguate.
	possibly: https://www.geonames.org (or https://cloud.google.com/maps-platform/places)
	may be helpful but lacks details: https://bioportal.bioontology.org/ontologies/GEO
	user location can have default value obtained through browser Geolocation API or ip geolocation:
		https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
		https://medium.com/@ipdata_co/what-is-the-best-commercial-ip-geolocation-api-d8195cda7027

User:
	obviously some internal id: int or uri
	username: maybe i'd leave this out
	full name: string, in case anyone would want to fill that in, eventually
	google/facebook etc logins
	

Campaign_description:
	content: Prose
	timestamp: Datetime
	created_by: User

Campaign:
	Campaign describes an action or set of actions that each participant can take, and goals or possible results.
	
	relevant_to_location: Location,	can be specified multiple times
	created: Datetime
	owner: User
	picture: file path?
	title: string
	description: Campaign_description
	
kinds of participation proclamations:
	maybe we should initially stick to just the simplest kind:
		
	Participation upon notice:
		the simplest kind. You proclaim that you'll start participating as soon as there is an X number of other participants. You will be alerted when this becomes the case. You can always amend or retract your proclamation.
	
		number of people: int
			this may be the simplest way to include for example a spouse or a friend
		user: User
		number_of_other_participants_condition: int
			this would be the simplest thing to do, if we limit types of participation to just "Participation upon notice"
			
		
		

## components of the UI
```
pages/windows:

	landing/welcome page:
		show featured campaigns. Ideally would be smart enough to select what's featured based on user location.
		lists let's say 3 campaigns ordered by "landing page order". determined by:
			"featuredness": an int property of Campaign, set by site admin in the db
			later:user location
			
			<CampaignPreview v-for:$featured_campaigns
			?c a Campaign...					
		

	browse campaigns:
		sorting:
			by creation datetime

		later:
			filtering:
				location-specific campaigns: (lists all campaigns related to a location)
					countries, cities

			fulltext search
		
--

	campaign detail:
		title
		locations
		description
		references/links
		event datetime (if applicable)
		author
		list of participants
		
		it would be nice to have at least this fully versioned/with auditable changes
	
--

	add/edit campaign:

		edit basic info
		
		work with participation estimates:
			a Campaign should have one number that the owner should strive to make it reflect the actual number of currently participating individuals. In the UI, it would be the one number displayed prominently, while clicking on it could show a breakdown. It would be a sum of several aspects:
				Unique IPs of anonymous/pseudonymous users
				number of socially-logged-in users
				estimate of unique participants expressed on other sites
				estimate of "offline" participants
				any adjustments, adding an adjustment of -10000 "users" that turned out to be a botnet
		
		possibly:
			event/observation condition objects administered by campaign owner or site admin:
				only plaintext for now, for example: "l'oreal stops testing on animals"
				state:
					* fulfilled
					* unfulfilled
				these could be referenced the conditions section of participation statements, for example, the Campaign is "Start buying L'Oreal", and this Campaign has an attached event condition "l'oreal stops testing on animals", and clicking "participate" automatically makes that the condition of the users participation.
				This shows to the company the positive support that it has for changing its practices. When the campaign owner sets the state to "fulfilled", all participants are noticed that it's time to act.

--

	participation:
		campaign: (title/link) (for example: "start buying l'oreal products")
		conditions:
		my identity:
			
			we need to lower the barrier as much as possible, so even without login, people can obviously browse campaigns, and click "participate" somewhere, but then, they should decide how much energy/privacy they want to invest in that participation statement. We can always store their IP address, which, in larger numbers/statistically/with some data clenup, could serve quite well in some cases. Ie, if i get 200K unique czech IPs at day of massive demonstration, and i don't have much reason to suspect that anyone would really profit from screwing up my estimates with a botnet, or, say, i'm able to determine that most of these IPs belonged to relatively secure devices, ie smartphones, then it's a reasonably good basis for publishing that number as an estimation of number of actually participating people.
			Campaign authors/site admins should have control over what numbers to display, ie, anything between raw number of IPs to manually entered numbers. The success of their campaign relies on keeping these numbers accurate.
			
			choices:
				* anonymous
				* nickname
				* facebook profile (can trigger login)
			privacy:
				* public
				* only known to this pod
		how to be notified when threshold is reached:
	
--

	about this site/support quor (tbd later).

--
```
## preliminary initial db schema, thanks to mst
```

User {
  email Email;
  password PasswordHash;
}

DayCount isa Int;
ParticipantCount isa Int;

Campaign {
  coordinator User;
  title SingleLineString;
  description Text;
  notification_interval DayCount;
  notification_threshold ParticipantCount;
}

PreCommitment {
  user User;
  campaign Campaign;
  registered_at TimeStamp;
  participant_threshold Int;
}

CoordinatorNotification {
  campaign Campaign;
  sent_at TimeStamp;
  sent_because JSON; # structured, provides which notification field triggered
  email Text; # record entire email, it's just useful later
}

CommitedUserNotification {
  campaign Campaign;
  triggered_at TimeStamp;
  notes Text; # co-ordinator fills these out
  email_template Text;
}

CommitedUserNotificationTransmissionState {
  transmission_of CommitedUserNotification;
  to_user User;
  last_attempted_at TimeStamp;
  email Text;
  status ??; # probably an enum of some variation?
  user_responded_at TimeStamp?;
  user_responded_with ??; # also probably an enum
}
```

# testcases that it makes sense to coordinate in small numbers of people
* flashmobs
* cooperative testcases..
* popularization of koordinator?


# sources of campaigns to add
* https://causes.com/actions/1805436-donate-to-provide-solar-power-to-indigenous-communities-in-the-amazon
https://www.ethicalconsumer.org/ethicalcampaigns/boycotts
https://github.com/aindilis/elle-ethical-consumer/blob/master/sample.xml
https://www.reddit.com/r/Anticonsumption/
https://www.reddit.com/r/Futurology/comments/da0214/the_35_rule_states_any_movement_that_gains_35_of/
https://github.com/yacy/yacy_search_server/issues/314
https://github.com/aindilis/elle-ethical-consumer/tree/master/subsys/source-analysis/source/causes
https://headlines.peta.org/air-france-stop-shipping-monkeys/#action
https://demo.mobilizon.org/events/e1f914a4-13e1-49ed-9e70-a99d6ae66df1
https://www.reddit.com/r/Anticonsumption/comments/kqhq8x/boycott_nestl%C3%A9/
https://www.reddit.com/r/Environmentalism/comments/kr0bpt/shells_hell/
https://rejstrik-firem.kurzy.cz/24741647/nomad-international-s-r-o-v-likvidaci/
https://play.google.com/store/apps/details?id=io.bobbele
* todo add campaign: reddit must die / be continued / be replaced (archived threads, bad attempts at monetization, etc etc).

# inspirations

https://theconversation.com/climate-crisis-we-are-not-individuals-fighting-a-faceless-system-we-are-the-system-that-needs-to-change-129513
https://airtable.com/shrVDkswEnsgA87yS
https://csarven.ca/linked-research-decentralised-web
https://thezvi.wordpress.com/2020/01/16/how-escape-from-immoral-mazes/
http://maslo.cz
https://github.com/TheDataRideAlongs/ProjectDomino
https://www.idnes.cz/zpravy/domaci/ochrana-zvirat-proti-tyrani-klecove-chovy-slepice.A200610_084300_domaci_kop
https://www.reddit.com/r/thevenusproject


# technology

Currently PostgreSQL / Hasura(GraphQL) / Svelte, soon Sapper. RDF will be used as an overlay over the core data model, to allow users and admins to express nuanced matters of provenance, trust and identity, help fight off bots, enable federation, express forecasts etc.


# todo?

* continue sketching out the format of "participation statements"
* make the coordinator fetch statements from known places, evaluate them, inform user of reached critical massess.
* work out an "estimate" format.
** I might be estimating that 54684 are already participating in the campaign, outside of/including information i have available by collecting statements with my crawler, and outside of/including estimates provided by others.

* collect published boycotts and other usecases
* automate generating and publishing statements of participation: 
** for example, i support everything that stoopkid supports, just with 10x higher limit 
** i support every ethicalconsumer boycott, but i will only provide my threshold upon (automatic?) request

* ????
* no profit.

# how to support "good" koordinations?
...


# similar or related sw
* https://github.com/researchstudio-sat/webofneeds
* https://humanifa.com/soporte
* https://github.com/peta-pico/debate-nanopubs
* https://pol.is/
* https://github.com/CitizenLabDotCo/citizenlab
