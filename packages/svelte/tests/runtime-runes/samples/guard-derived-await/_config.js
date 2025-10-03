import { test } from '../../test';
import { flushSync, tick } from 'svelte';

export default test({
	mode: ['client'],
	async test({ target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());
		await tick();

		const text = target.textContent?.trim() ?? '';
		if (!text.endsWith('trigger')) {
			throw new Error(`unexpected text: ${text}`);
		}
	}
});
