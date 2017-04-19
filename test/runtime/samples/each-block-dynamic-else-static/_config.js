export default {
	data: {
		animals: [ 'alpaca', 'baboon', 'capybara' ]
	},

	html: `
		<p>alpaca</p>
		<p>baboon</p>
		<p>capybara</p>
	`,

	test ( assert, component, target ) {
		component.set({ animals: [] });
		assert.htmlEqual( target.innerHTML, `
			<p>no animals</p>
		` );

		// trigger an 'update' of the else block, to ensure that
		// non-existent update method is not called
		component.set({ animals: [] });

		component.set({ animals: ['wombat'] });
		assert.htmlEqual( target.innerHTML, `
			<p>wombat</p>
		` );
	}
};
