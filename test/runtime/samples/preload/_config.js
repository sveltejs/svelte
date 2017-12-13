export default {
	test(assert, component) {
		const Component = component.constructor;
		assert.deepEqual(Component.preload({ foo: 1 }), { bar: 2 });
	}
};