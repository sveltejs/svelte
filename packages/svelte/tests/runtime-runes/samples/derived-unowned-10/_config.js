import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		let btn1 = target.querySelector('button');

		btn1?.click();
		flushSync();

		btn1?.click();
		flushSync();

		btn1?.click();
		flushSync();

		assert.deepEqual(logs, ['light', 'dark', 'light']);
	}
});
