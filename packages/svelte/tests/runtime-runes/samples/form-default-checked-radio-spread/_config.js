import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],

	async test({ assert, target }) {
		const [a, b, reset] = target.querySelectorAll('input');

		// let the deferred hydration cleanup run
		await Promise.resolve();
		flushSync();

		b.checked = true;
		reset.click();
		await Promise.resolve();
		flushSync();

		assert.equal(a.defaultChecked, true);
		assert.equal(a.checked, true);
		assert.equal(b.checked, false);
	}
});
