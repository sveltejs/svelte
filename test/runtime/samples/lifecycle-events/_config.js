export default {
	test(assert, component) {
		assert.deepEqual(component.events, ['create']);
		component.destroy();
		assert.deepEqual(component.events, ['create', 'destroy']);
	}
};
