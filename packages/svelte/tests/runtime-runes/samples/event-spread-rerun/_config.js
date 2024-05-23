import { flushSync } from 'svelte';
import { test, ok } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, logs, target }) {
		const input = target.querySelector('input');
		ok(input);

		input.value = 'foo';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		assert.deepEqual(logs, ['hi']);
	}
});
