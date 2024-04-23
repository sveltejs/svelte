import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, logs, target }) {
		const button = target.querySelector('button');
		ok(button);

		flushSync(() => {
			button.click();
		});

		assert.deepEqual(logs, ['1 - 1']);

		flushSync(() => {
			button.click();
		});

		assert.deepEqual(logs, ['1 - 1', '2 - 2']);
	}
});
