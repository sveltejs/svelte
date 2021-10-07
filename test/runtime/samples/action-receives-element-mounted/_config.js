const result = {};

export default {
	props: { result },
	async test({ assert }) {
		assert.notEqual(result.parentElement, null);
	}
};
