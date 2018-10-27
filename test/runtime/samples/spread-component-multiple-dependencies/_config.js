export default {
	html: `b baz`,
	test(assert, component, target) {
		component.set({ foo: true });
		assert.htmlEqual(
			target.innerHTML,
			`a baz`
		);
	},
};
