import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		let [btn1] = target.querySelectorAll('button');

		btn1?.click();
		flushSync();

		btn1?.click();
		flushSync();

		logs.length = 0;

		btn1?.click();
		flushSync();

		assert.deepEqual(logs, ['a', { value: 1 }]);

		logs.length = 0;

		btn1?.click();
		flushSync();

		assert.deepEqual(logs, ['a', { value: 2 }, 'b', { a: 2 }, 'c', { b: 2 }]);
	}
});
