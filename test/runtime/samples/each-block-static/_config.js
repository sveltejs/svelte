export default {
	data: {
		items: []
	},

	html: ``,

	test (assert, component, target) {
		component.set({ items: ['x'] });
		assert.htmlEqual(target.innerHTML, `foo`);
	}
};
