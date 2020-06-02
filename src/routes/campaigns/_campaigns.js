// iow, this just exports data for other js files

const campaigns = [
	{
		title: 'donate $10 to koordinator',
		slug: 'donate1',
		html_description: `
			<p>First, you have to know what <a href='https://koordinator.frdcsa.org'>Koordinator</a> is. Go try to make sense of the <a href='https://github.com/koo5/koordinator2000/blob/master/README.md'>readme</a>.
			
			<ul>
				<li>donate!</li>
			</ul>

			<p>This will feed aindils for a couple of days so he can focus on koordinator.</p>
		`,
		pledged_people_count: 1
	},
	{
		title: 'go to bed',
		slug: 'go_to_bed',
		html_description: `
			i will go to bed (my bed) if you go to bed (your bed).
		`,
		pledged_people_count: 1
	}
];

campaigns.forEach(campaign => {
	campaign.html_description = campaign.html_description.replace(/^\t{3}/gm, '');
});

export default campaigns;
