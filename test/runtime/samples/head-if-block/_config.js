export default {
	data: {
		condition: false
	},

	test(assert, component, target, window) {
		assert.equal(window.document.title, '');

		component.set({ condition: true });
		assert.equal(window.document.title, 'woo!!!');
	}
};