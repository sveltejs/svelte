import { test } from '../../assert';
import { log } from './log.js';

export default test({
	async test({ assert }) {
		await new Promise((fulfil) => setTimeout(fulfil, 0));

		assert.deepEqual(log, [
			[false, 0, 0],
			[true, 100, 100]
		]);
	}
});
