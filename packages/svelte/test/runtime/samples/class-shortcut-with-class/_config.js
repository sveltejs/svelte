export default {
	get props() {
		return { foo: true, bar: true, myClass: 'one two' };
	},

	html: '<div class="one two foo bar"></div>',

	test({ assert, component, target }) {
		component.foo = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="one two bar"></div>
		`
		);
	}
};
