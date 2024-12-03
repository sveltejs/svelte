import { test } from '../../test';

export default test({
	test({ target, assert, logs }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		input.value = 'everybody';
		input.dispatchEvent(new window.Event('input'));

		assert.deepEqual(logs, [false]);
	}
});
