const result = {};

export default {
	get props() {
		return { result };
	},
	async test({ assert }) {
		assert.notEqual(result.parentElement, null);
	}
};
