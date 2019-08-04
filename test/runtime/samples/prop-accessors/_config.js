export default {
	accessors: false,
	test({ assert, component }) {
		assert.equal(component.foo1, 42);
		assert.equal(component.foo2(), 42);
		assert.equal(component.bar, undefined);
		component.foo1 = null;
		component.foo2 = null;
		assert.equal(component.foo1, 42);
		assert.equal(component.foo2(), 42);
	}
};
