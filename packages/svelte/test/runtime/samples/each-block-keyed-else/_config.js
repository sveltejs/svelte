export default {
	get props() {
		return {
			animals: ['alpaca', 'baboon', 'capybara'],
			foo: 'something else'
		};
	},

	html: `
		before
		<p>alpaca</p>
		<p>baboon</p>
		<p>capybara</p>
		after
	`,

	test({ assert, component, target }) {
		component.animals = [];
		assert.htmlEqual(
			target.innerHTML,
			`
			before
			<p>no animals, but rather something else</p>
			after
		`
		);

		component.foo = 'something other';
		assert.htmlEqual(
			target.innerHTML,
			`
			before
			<p>no animals, but rather something other</p>
			after
		`
		);

		component.animals = ['wombat'];
		assert.htmlEqual(
			target.innerHTML,
			`
			before
			<p>wombat</p>
			after
		`
		);
	}
};
