import { test } from '../../test';
import { log } from './log';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [btn1, btn2, btn3, btn4, btn5] = target.querySelectorAll('button');

		log.length = 0;

		await btn1?.click();
		assert.deepEqual(log, ['f', [1, 0], 'first', 1]);

		log.length = 0;

		await btn5?.click();
		assert.deepEqual(log, ['f', [0, 0], 'first', 0]);

		await btn1?.click();
		await btn1?.click();
		await btn1?.click();

		log.length = 0;

		await btn5?.click();
		assert.deepEqual(log, ['f', [4, 0], 'first', 4]);

		log.length = 0;

		await btn3?.click();
		await btn3?.click();
		await btn3?.click();

		await btn5?.click();
		assert.deepEqual(log, ['f', [3, 0], 'first', 3]);
	}
});
