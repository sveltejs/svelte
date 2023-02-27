export default {
	props: {
		foo: true
	},

	html: 'foo',

	test({ assert, component, target }) {
		component.foo = false;
		assert.htmlEqual(target.innerHTML, 'bar');
	}
};
