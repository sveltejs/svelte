export default {
	props: {
		foo: 1
	},

	html: `1`,

	async test({ assert, component, target }) {
		component.foo = 2;
		assert.htmlEqual(target.innerHTML, `2`);
	}
};