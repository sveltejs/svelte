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
		assert.deepEqual(result, ['each_action', 'import_action']); // ideally this would be reversed, but it doesn't matter a whole lot
	}
});
