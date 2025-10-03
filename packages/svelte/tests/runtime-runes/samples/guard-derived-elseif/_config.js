import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	mode: ['client'],
	async test({ target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		const text = target.textContent?.trim() ?? '';
		if (!text.endsWith('switch')) {
			throw new Error(`unexpected text: ${text}`);
		}
	}
});
