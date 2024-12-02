import { flushSync } from 'svelte';
import { ok, test } from '../../test';

/** @type {string[]} */
let value;
let called = 0;

/** @param {string[]} _value */
function callback(_value) {
	called++;
	value = _value;
}

export default test({
	get props() {
		return { callback };
	},
	before_test() {
		called = 0;
	},
	test({ assert, target, window }) {
		assert.equal(called, 1);

		const input = target.querySelector('input');
		ok(input);

		const event = new window.Event('input');
		input.value = 'h';
		input.dispatchEvent(event);
		flushSync();

		assert.equal(called, 2);
		assert.equal(value.length, 3);
		assert.equal(value[0], 'h');
		assert.equal(value[1], '2');
		assert.equal(value[2], '3');
	}
});
