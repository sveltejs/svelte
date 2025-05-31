import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, logs }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		assert.equal(input?.value, 'rich');

		assert.deepEqual(logs, []);

		const inputEvent = new window.InputEvent('input');
		input.value = 'dan';
		await input.dispatchEvent(inputEvent);

		flushSync();

		assert.deepEqual(logs, ['name in child: dan']);

		logs.length = 0;

		input.value = 'da';
		await input.dispatchEvent(inputEvent);

		flushSync();

		assert.deepEqual(logs, []);
	}
});
