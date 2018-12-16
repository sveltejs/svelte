export default {
	test({ assert, component }) {
		assert.equal(component.one.snapshot, 2);
	}
};