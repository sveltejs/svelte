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
			valueOnDestroy = component.get('foo');
		});

		component.observe('foo', foo => {
			values.push(foo);
		});

		component.destroy();

		assert.deepEqual(values, [1, 2]);
		assert.equal(valueOnDestroy, 2);
	}
};
