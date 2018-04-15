export default {
	test(assert, component) {
		let count = 0;

		component.on('state', ({ changed }) => {
			if (changed.bar) count += 1;
		});

		component.set({ x: true });
		assert.equal(count, 0);
	}
};
