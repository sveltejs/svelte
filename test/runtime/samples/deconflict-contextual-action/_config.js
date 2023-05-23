let result;

export default {
	before_test() {
		result = [];
	},
	get props() {
		return { collect: (str) => result.push(str) };
	},
	test({ assert }) {
		assert.deepEqual(result, ['each_action', 'import_action']);
	}
};
