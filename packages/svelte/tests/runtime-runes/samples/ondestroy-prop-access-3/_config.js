import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const [btn1] = target.querySelectorAll('button');

		btn1.click();
		flushSync();
	}
});
