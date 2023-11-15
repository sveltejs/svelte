import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	async test({ assert, target, component }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		assert.equal(input?.value, 'rich');

		assert.deepEqual(component.log, []);

		const inputEvent = new window.InputEvent('input');
		input.value = 'dan';
		await input.dispatchEvent(inputEvent);

		flushSync();

		assert.deepEqual(component.log, ['name in child: dan']);

		component.log.length = 0;

		input.value = 'da';
		await input.dispatchEvent(inputEvent);

		flushSync();

		assert.deepEqual(component.log, []);
	}
});
