export default {
	get props() {
		return { foo: true, bar: true };
	},

	html: '<div class="foo bar"></div>',

	test({ assert, component, target }) {
		component.foo = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="bar"></div>
		`
		);
	}
};
