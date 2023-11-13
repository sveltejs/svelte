import { test } from '../../test';

/** @type {Record<string, any>} */
const result = {};

export default test({
	get props() {
		return { result };
	},
	async test({ assert }) {
		assert.notEqual(result.parentElement, null);
	}
});
