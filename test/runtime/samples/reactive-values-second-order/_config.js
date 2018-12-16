export default {
	test({ assert, component, target }) {
		assert.equal(component.qux, 2);

		component.foo = 2;
		assert.equal(component.qux, 4);
	}
};
