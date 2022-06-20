export default {
	test({ assert, component }) {
		assert.deepEqual(component.foo, { baz: 1 });
	}
};
