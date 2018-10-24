export default {
	data: {
		show: false,
		foo: {}
	},

	html: ``,

	test (assert, component, target, window) {
		const changes = [];

		component.on('update', ({ changed }) => {
			changes.push(changed);
		});

		component.set({ show: true });

		assert.deepEqual(changes, [
			{ show: true }
		]);
	}
};
