export default {
	test(assert, component) {
		assert.equal(component.refs.one.snapshot, 2);
	}
};