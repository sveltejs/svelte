export default {
	props: {
		items: []
	},

	html: ``,

	test (assert, component, target) {
		component.set({ items: ['x'] });
		assert.htmlEqual(target.innerHTML, `foo`);
	}
};
