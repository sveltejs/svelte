export default {
	accessors: false,
	test({ assert, component }) {
		assert.equal(component.foo1, 42);
		assert.equal(component.foo2(), 42);
		assert.equal(component.bar, undefined);

		assert.throws(() => {
			component.foo1 = null;
		}, /Cannot set property foo1 of/);

		assert.throws(() => {
			component.foo2 = null;
		}, /Cannot set property foo2 of/);
	}
};
