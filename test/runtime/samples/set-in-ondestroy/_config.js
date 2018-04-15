export default {
	'skip-ssr': true,

	data: {
		foo: 1
	},

	test(assert, component) {
		const values = [];
		let valueOnDestroy;

		component.on('destroy', () => {
			component.set({ foo: 2 });
			valueOnDestroy = component.get().foo;
		});

		component.on('state', ({ current }) => {
			values.push(current.foo);
		});

		component.destroy();

		assert.deepEqual(values, [2]);
		assert.equal(valueOnDestroy, 2);
	}
};
