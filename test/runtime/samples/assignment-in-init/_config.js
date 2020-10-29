export default {
	test({ assert, component }) {
		assert.equal(component.get_foo(), 1);
		assert.equal(component.get_bar(), 2);
	}
};
