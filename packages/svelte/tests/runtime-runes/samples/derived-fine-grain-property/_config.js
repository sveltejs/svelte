import { test } from '../../test';
import { log } from './log';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		log.length = 0;

		await btn1?.click();
		assert.deepEqual(log, ['c', { a: 1, b: 0 }, 'a', 1]);

		log.length = 0;

		await btn2?.click();
		assert.deepEqual(log, ['c', { a: 1, b: 1 }, 'b', 1]);
	}
});
