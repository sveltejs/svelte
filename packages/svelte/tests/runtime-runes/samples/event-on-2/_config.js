import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');

		const keydown = new window.KeyboardEvent('keydown', { bubbles: true });

		b1?.dispatchEvent(keydown);
		flushSync();
		assert.deepEqual(logs, ['parent keydown']);
	}
});
