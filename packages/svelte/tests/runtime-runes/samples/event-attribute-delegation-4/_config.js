import { test } from '../../test';
import { log } from './log.js';

export default test({
	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1?.click();
		await Promise.resolve();
		assert.deepEqual(log, [
			'button main',
			'div main 1',
			'div main 2',
			'document main',
			'document sub',
			'window main',
			'window sub'
		]);

		log.length = 0;
		btn2?.click();
		await Promise.resolve();
		assert.deepEqual(log, [
			'button sub',
			'document main',
			'document sub',
			'window main',
			'window sub'
		]);
	}
});
