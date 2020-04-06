# What
Most of us would make our world better if we could. Or at least different. 

## Politics

For example, you would vote that tiny progressive political party, if you knew your vote would matter. So let's get to work to make it matter. Don't waste your vote until you know there is a mass large enough to make it count. 

## Consumers

The same principle applies to pressuring corporations by boycotts, or, more widely, changing consumer habits. If you choose to buy the more ethical brand every time, you'll soon be out of money, and the less ethical brand will still be going strong, but if enough people focus on the same issue at the same time, changes happen. In our current society, this is only achieved in extraordinary cases, but now, with almost everyone on-line, we can make it the norm.

## Companies

The same issue exists on the companies side. If there isn't a long-term pressure from customers to change, then, for example, choosing a more ethical supplier and raising prices only means shelling money out of their own pocket while another company moves into the empty space and voids their effort. 

# How
Express your support for cause. Express under what conditions are you willing to invest the energy. I will only switch to the more expensive, more ethical brand if 10000 other people do. Express it in a way that computer can understand it. 


## How to reach critical mass
### 1
First, the website has to be finished and polished. And ideally a mobile app too. 
### 2
Some worthwhile causes should be collected, as examples, to give people reason to click around and share.
### 3
An issue that already reached good critical mass has to be identified. Something that would benefit from additional coordination. An example from Czech Republic is the 2019 event of 250 000 people gathering to protest against prime minister Babiš, and to block the many products of His Agrofert holding. A reasonably sized effort also happened outside of streets and social media, for example a chrome extension that helps online shoppers avoid Agrofert's products. Eventually the momentum all but died out, without effect. I postulate that things would have evolved differently if each of those 250 000 people that gathered would be introduced to the application and encouraged to coordinate through it. I postulate that the biggest obstacle to an individual's effort is this lack of confidence in other's sustained effort, and by extension, each of us includes this shared lack of confidence in our calculations.


## extensibility, decentralization
this is an open protocol. If you are tech-saavy, you are encouraged to:
*  publish your own statements of participation
(todo: link to the ontology, to some generator, etc)
* extend the data scheme of participation conditions
currently, the only method of specifying your conditions is the "number of others willing to participate" (todo: fill in the actual rdf predicate name), which more precisely means: "number of others whose number of others willing to participate has been reached". And these "others", precisely, are other users who expressed their identify by logging into * website with their google/facebook/etc account. At some point, a need may arise to have somebody:
* estimate how many of these accounts belong to real people
* estimate how many people are already commited and participating outside of this platform
* expressed their intent to participate through other similar platforms
etc.

# current status
mocking up the app: https://koordinator.knack.com/koordinator#campaigns/


# condition language/ontology:
	condition := condition or condition
	condition := condition and condition
	condition := number of participants
	condition := number of confirmed participants
	condition := number of estimated participants
	

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



