import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ target }) {
		let button = target.querySelector('button');

		button?.click();

		flushSync();
	}
});
