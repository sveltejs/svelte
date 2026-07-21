import { flushSync } from 'svelte';
import { ok, test } from '../../assert';

export default test({
	async test({ target, assert }) {
		const select = target.querySelector('select');
		ok(select);

		select.value = 'B';
		select.dispatchEvent(new Event('input', { bubbles: true }));

		// because another element has a delegated `oninput` handler, a global `input`
		// listener runs and, once it returns, a microtask checkpoint delivers the
		// mutation records *before* the `change` event — we emulate that checkpoint here
		await Promise.resolve();

		select.dispatchEvent(new Event('change', { bubbles: true }));
		flushSync();

		assert.equal(select.value, 'B');
	}
});
