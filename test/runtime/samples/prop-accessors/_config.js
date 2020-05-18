export default {
	accessors: false,
	test({ assert, component }) {
		assert.equal(component.foo1, 42);
		assert.equal(component.foo2(), 42);
		assert.equal(component.bar, undefined);
		try {
			component.foo1 = null;
			component.foo2 = null;
		} catch (e) {
			assert.equal(e.message, 'Cannot set property foo1 of #<Main$> which has only a getter');
		}
		assert.equal(component.foo1, 42);
		assert.equal(component.foo2(), 42);
	},
};
