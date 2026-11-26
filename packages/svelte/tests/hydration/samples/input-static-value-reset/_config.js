import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test(assert, target) {
		const inputs = target.querySelectorAll('input');
		const [reset, change_default] = target.querySelectorAll('button');

		await Promise.resolve();
		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['initial', 'initial', 'initial']
		);
		assert.deepEqual(
			Array.from(inputs, (input) => input.defaultValue),
			['', 'explicit', 'default']
		);

		for (const input of inputs) {
			input.value = 'edited';
		}

		reset.click();
		await Promise.resolve();
		flushSync();

		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['', 'explicit', 'default']
		);

		change_default.click();
		flushSync();

		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['', 'explicit', 'default']
		);
		assert.deepEqual(
			Array.from(inputs, (input) => input.defaultValue),
			['', 'explicit', 'changed']
		);

		reset.click();
		await Promise.resolve();
		flushSync();

		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['', 'explicit', 'changed']
		);
	}
});
