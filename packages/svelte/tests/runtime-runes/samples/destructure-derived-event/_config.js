import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		await btn?.click();

		assert.deepEqual(log, ['works!']);
	}
});
