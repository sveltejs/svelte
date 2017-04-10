export default {
	data: {
		animals: [ 'alpaca', 'baboon', 'capybara' ],
		foo: 'something else'
	},

	html: `
		before
		<p>alpaca</p>
		<p>baboon</p>
		<p>capybara</p>
		after
	`,

	test ( assert, component, target ) {
		component.set({ animals: [] });
		assert.htmlEqual( target.innerHTML, `
			before
			<p>no animals, but rather something else</p>
			after
		` );

		component.set({ foo: 'something other' });
		assert.htmlEqual( target.innerHTML, `
			before
			<p>no animals, but rather something other</p>
			after
		` );

		component.set({ animals: ['wombat'] });
		assert.htmlEqual( target.innerHTML, `
			before
			<p>wombat</p>
			after
		` );
	}
};
