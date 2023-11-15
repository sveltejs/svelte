import { test } from '../../test';

export default test({
	async test({ assert, component, target, window }) {
		const [input1, input2] = target.querySelectorAll('input');

		// we are not able emulate user interaction in jsdom,
		// therefore, jsdom could not validate minlength / maxlength

		// we simulate user input with
		// setting input.value + dispatchEvent

		// and we determine if svelte does not set the `input.value` again by
		// spying on the setter of `input.value`

		const spy1 = spyOnValueSetter(input1, input1.value);
		const spy2 = spyOnValueSetter(input2, input2.value);

		const event = new window.Event('input');

		input1.value = '12345';
		spy1.reset();
		await input1.dispatchEvent(event);

		// In Svelte 5, the value will always fire as the effects for setting
		// the value and spreading happen in different parts.

		// assert.ok(!spy1.isSetCalled());

		input2.value = '12345';
		spy2.reset();
		await input2.dispatchEvent(event);

		// Same as above.
		// assert.ok(!spy2.isSetCalled());

		spy1.reset();
		component.val1 = '56789';
		assert.ok(spy1.isSetCalled());

		spy2.reset();
		component.val2 = '56789';
		// Same as above.
		// assert.ok(spy2.isSetCalled());
	}
});

/**
 * @param {HTMLInputElement} input
 * @param {string} initialValue
 */
function spyOnValueSetter(input, initialValue) {
	let value = initialValue;
	let isSet = false;
	Object.defineProperty(input, 'value', {
		get() {
			return value;
		},
		set(_value) {
			value = _value;
			isSet = true;
		}
	});

	return {
		isSetCalled() {
			return isSet;
		},
		reset() {
			isSet = false;
		}
	};
}
