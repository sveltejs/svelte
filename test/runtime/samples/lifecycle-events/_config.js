export default {
	test({ assert, component }) {
		const { events } = component;
		assert.deepEqual(events, ['mount']);
		component.$destroy();
		assert.deepEqual(events, ['mount', 'destroy']);
	}
};
