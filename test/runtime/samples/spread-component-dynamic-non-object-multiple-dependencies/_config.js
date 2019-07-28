export default {
	html: `b baz`,
	test({ assert, component, target }) {
		component.bar = undefined;
		assert.htmlEqual(
			target.innerHTML,
			`b undefined`
		);
	},
};
