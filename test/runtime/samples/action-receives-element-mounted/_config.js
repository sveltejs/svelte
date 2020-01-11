const result = {};

export default {
	props: { result },
	async test({ assert, component, target, window }) {
		assert.notEqual(result.parentElement, null);
	}
};
