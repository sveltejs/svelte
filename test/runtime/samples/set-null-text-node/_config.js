export default {
	props: { foo: null },

	html: 'foo is null',

	test({ assert, component, target }) {
		component.foo = 42;
		assert.htmlEqual(target.innerHTML, 'foo is 42');

		component.foo = null;
		assert.htmlEqual(target.innerHTML, 'foo is null');
	}
};
