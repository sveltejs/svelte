export default {
	get props() {
		return { foo: true };
	},

	html: '<div>A wild component appears</div>',

	test({ assert, component, target }) {
		component.foo = false;
		assert.htmlEqual(target.innerHTML, '');
	}
};
