import { test } from '../../test';
import { log } from './log';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		log.length = 0;

		await btn1?.click();
		assert.deepEqual(log, ['d', [1, 0], 'a', 1]);

		log.length = 0;

		await btn2?.click();
		assert.deepEqual(log, ['d', [1, 1], 'b', 1]);

		log.length = 0;

		await btn3?.click();
		assert.deepEqual(log, ['d', null, 'a', undefined, 'b', undefined]);

		log.length = 0;

		await btn3?.click();
		assert.deepEqual(log, ['d', [1, 1], 'a', 1, 'b', 1]);

		log.length = 0;

		await btn1?.click();
		assert.deepEqual(log, ['d', [2, 1], 'a', 2]);

		log.length = 0;

		await btn2?.click();
		assert.deepEqual(log, ['d', [2, 2], 'b', 2]);
	}
});
