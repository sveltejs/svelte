import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ target, logs, assert }) {
		const div = target.querySelector('div');
		const button = target.querySelector('button');

		assert.deepEqual(logs, ['updated attribute', 'updated directive']);

		assert.ok(div?.classList.contains('dark'));
		assert.ok(div?.classList.contains('small'));

		flushSync(() => button?.click());
		assert.deepEqual(logs, ['updated attribute', 'updated directive', 'updated attribute']);
		assert.ok(div?.classList.contains('dark'));
		assert.ok(div?.classList.contains('big'));
	}
});
