import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert }) {
		await Promise.resolve();
		await Promise.resolve();
		assert.deepEqual(log, ['a1: ', true, 'b1: ', true]);
	}
});
