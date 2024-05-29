import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {number | undefined} */
			value: undefined
		};
	},
	test({ assert, target, window, component }) {
		const input = target.querySelector('input');
		ok(input);
		const inputEvent = new window.InputEvent('input');
		assert.equal(component.value, 5);
		assert.equal(input.value, '5');

		input.value = '5.';
		input.dispatchEvent(inputEvent);
		flushSync();

		// input type number has value === "" if ends with dot/comma
		assert.equal(component.value, undefined);
		assert.equal(input.value, '');

		input.value = '5.5';
		input.dispatchEvent(inputEvent);
		flushSync();

		assert.equal(component.value, 5.5);
		assert.equal(input.value, '5.5');

		input.value = '5.50';
		input.dispatchEvent(inputEvent);
		flushSync();

		assert.equal(component.value, 5.5);
		assert.equal(input.value, '5.50');

		component.value = 1;
		assert.equal(component.value, 1);
		assert.equal(input.value, '1');
	}
});
