import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		btn2?.click();
		btn1?.click();
		flushSync();

		assert.deepEqual(logs, ['error caught!!!']);
	}
});
