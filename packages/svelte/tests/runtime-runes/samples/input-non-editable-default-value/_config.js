import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const inputs = target.querySelectorAll('input');
		const [change_default] = target.querySelectorAll('button');

		await Promise.resolve();
		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['default', 'default', 'default', 'default']
		);

		change_default.click();
		flushSync();

		// For input types whose value is not user-editable state (hidden, checkbox, radio,
		// submit), a changed default also becomes the current value.
		assert.deepEqual(
			Array.from(inputs, (input) => input.value),
			['changed', 'changed', 'changed', 'changed']
		);
		assert.deepEqual(
			Array.from(inputs, (input) => input.defaultValue),
			['changed', 'changed', 'changed', 'changed']
		);
	}
});
