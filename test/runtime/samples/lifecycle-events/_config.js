export default {
	test(assert, component) {
		assert.deepEqual(component.events, ['mount']);
		component.$destroy();
		assert.deepEqual(component.events, ['mount', 'destroy']);
	}
};
