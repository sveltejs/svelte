export default {
	data: { foo: null },

	html: 'foo is null',

	test(assert, component, target) {
		component.set({ foo: 42 });
		assert.htmlEqual(target.innerHTML, 'foo is 42');

		component.set({ foo: null });
		assert.htmlEqual(target.innerHTML, 'foo is null');
	}
};