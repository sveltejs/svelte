export default {
	solo: true,

	data: {
		adjective: 'custom'
	},

	test(assert, component, target, window) {
		assert.equal(window.document.title, 'a custom title');

		component.set({ adjective: 'different' });
		assert.equal(window.document.title, 'a different title');
	}
};