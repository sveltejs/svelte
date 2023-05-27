export default {
	get props() {
		return { foo: true };
	},

	html: 'foo',

	test({ assert, component, target }) {
		component.foo = false;
		assert.htmlEqual(target.innerHTML, 'bar');
	}
};
