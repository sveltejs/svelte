export default {
	test(assert, component) {
		const foo = component.refs.foo;
		let count = 0;

		foo.on('state', ({ changed }) => {
			if (changed.foo) count += 1;
		});

		assert.equal(count, 0);

		component.set({ y: {} });
		assert.equal(count, 0);
	}
};
