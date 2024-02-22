import { test } from '../../test';
import { log } from './log.js';

export default test({
	html: `<button>increment</button>`,

	before_test() {
		log.length = 0;
	},

	async test({ assert, target }) {
		const btn = target.querySelector('button');

		assert.deepEqual(log, [1]);

		await btn?.click();
		assert.deepEqual(log, [1, 2]);

		await btn?.click();
		assert.deepEqual(log, [1, 2, 3]);
	}
});
