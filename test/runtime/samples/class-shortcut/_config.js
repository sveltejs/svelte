export default {
	props: {
		foo: true,
		bar: true
	},

	html: `<div class="foo bar"></div>`,

	test({ assert, component, target, window }) {
		component.foo = false;

		assert.htmlEqual(target.innerHTML, `
			<div class="bar"></div>
		`);
	}
};
