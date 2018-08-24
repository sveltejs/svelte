export default {
	html: 'foo is ',

	test(assert, component, target) {
		component.set({ foo: 42 });
		assert.htmlEqual(target.innerHTML, 'foo is 42');

		component.set({ foo: undefined });
		assert.htmlEqual(target.innerHTML, 'foo is ');
	}
};