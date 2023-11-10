import { test } from '../../test';

/** @type {string[]} */
let result;

export default test({
	before_test() {
		result = [];
	},
	get props() {
		return {
			/** @param {string} str */
			collect: (str) => result.push(str)
		};
	},
	test({ assert }) {
		assert.deepEqual(result, ['import_action', 'each_action']);
	}
});
