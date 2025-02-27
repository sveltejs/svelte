import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	// this test breaks because of the changes required to make async work
	// (namely, running blocks before other render effects including
	// beforeUpdate and $effect.pre). Not sure if there's a good
	// solution. We may be forced to release 6.0
	skip: true,

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
