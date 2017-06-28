export default {
	data: {
		noanimals: [ 'alpaca', 'baboon', 'capybara' ]
	},

	html: `
		<p>alpaca</p>
		<p>baboon</p>
		<p>capybara</p>
	`,

	test ( assert, component, target ) {
		component.set({ noanimals: [ 'alpaca', 'baboon', 'caribou', 'dogfish' ] });
		assert.htmlEqual( target.innerHTML, `` );

		component.set({ animals: [] });
		assert.htmlEqual( target.innerHTML, '' );
	}
};
