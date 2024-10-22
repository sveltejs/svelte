import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const btn = target.querySelector('button');
		flushSync(() => {
			btn?.click();
		});
		assert.deepEqual(logs, [false]);
		flushSync(() => {
			btn?.click();
		});
		assert.deepEqual(logs, [false, false]);
	}
});
