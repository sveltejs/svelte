export default {
	description: 'nested {{#each}} blocks where inner iterates over property of outer',
	data: {
		categories: [
			{
				name: 'animals',
				things: [
					{ name: 'aardvark' },
					{ name: 'buffalo' },
					{ name: 'chinchilla' }
				]
			},
			{
				name: 'countries',
				things: [
					{ name: 'albania' },
					{ name: 'brazil' },
					{ name: 'china' }
				]
			},
			{
				name: 'people',
				things: [
					{ name: 'alice' },
					{ name: 'bob' },
					{ name: 'carol' },
					{ name: 'dave' }
				]
			}
		]
	},
	html: `<p>animals: aardvark</p><p>animals: buffalo</p><p>animals: chinchilla</p><!--#each category.things--><p>countries: albania</p><p>countries: brazil</p><p>countries: china</p><!--#each category.things--><p>people: alice</p><p>people: bob</p><p>people: carol</p><p>people: dave</p><!--#each category.things--><!--#each categories-->`,
	test ( component, target ) {
		// TODO
	}
};
