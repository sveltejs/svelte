export default {
	props: {
		animals: [ 'alpaca', 'baboon', 'capybara' ]
	},

	html: `
		<p>alpaca</p>
		<p>baboon</p>
		<p>capybara</p>
	`,

	test({ assert, component, target }) {
		component.animals = [];
		assert.htmlEqual( target.innerHTML, `
			<p>no animals</p>
		` );

		// trigger an 'update' of the else block, to ensure that
		// nonexistent update method is not called
		component.animals = [];

		component.animals = ['wombat'];
		assert.htmlEqual( target.innerHTML, `
			<p>wombat</p>
		` );

		component.animals = ['dinosaur'];
		assert.htmlEqual( target.innerHTML, `
			<p>dinosaur</p>
		` );
	}
};
