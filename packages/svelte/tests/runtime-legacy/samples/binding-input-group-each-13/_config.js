import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const [input1, input2] = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('input[type=text]')
		);
		const radio = /** @type {HTMLInputElement} */ (target.querySelector('input[type=radio]'));

		assert.equal(radio.checked, false);

		const event = new window.Event('input');

		input1.value = 'world';
		input1.dispatchEvent(event);
		flushSync();
		assert.equal(radio.checked, true);

		input2.value = 'foo';
		input2.dispatchEvent(event);
		flushSync();
		assert.equal(radio.checked, false);

		input1.value = 'foo';
		input1.dispatchEvent(event);
		flushSync();
		assert.equal(radio.checked, true);

		input1.value = 'bar';
		input1.dispatchEvent(event);
		flushSync();
		assert.equal(radio.checked, false);

		input2.value = 'bar';
		input2.dispatchEvent(event);
		flushSync();
		assert.equal(radio.checked, true);
	}
});
