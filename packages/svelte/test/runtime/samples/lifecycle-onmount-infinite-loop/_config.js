export default {
	test({ assert, component }) {
		const { count } = component;
		assert.deepEqual(count, 1);
	}
};
