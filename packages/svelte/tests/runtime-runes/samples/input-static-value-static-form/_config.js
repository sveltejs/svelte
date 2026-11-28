import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [input] = target.querySelectorAll('input');
		const [reset] = target.querySelectorAll('button');

		await Promise.resolve();
		// A static input inside an otherwise fully static form still mounts
		// with its `value` applied as the current value.
		assert.equal(input.value, 'initial');

		input.value = 'edited';
		reset.click();
		await Promise.resolve();

		// The static value is current-only: a form reset restores the
		// explicit defaultValue, or empty if there is none.
		assert.equal(input.value, '');
	}
});
