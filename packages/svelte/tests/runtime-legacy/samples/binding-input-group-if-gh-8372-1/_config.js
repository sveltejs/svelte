import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, target, component, window }) {
		const button = target.querySelector('button');
		ok(button);
		const clickEvent = new window.Event('click', { bubbles: true });
		const changeEvent = new window.Event('change');

		const [input1, input2] = /** @type {NodeListOf<HTMLInputElement>} */ (
			target.querySelectorAll('input[type="checkbox"]')
		);

		/**
		 * @param {boolean} v1
		 * @param {boolean} v2
		 */
		function validate_inputs(v1, v2) {
			assert.equal(input1.checked, v1);
			assert.equal(input2.checked, v2);
		}

		assert.deepEqual(component.test, []);
		validate_inputs(false, false);

		component.test = ['a', 'b'];
		validate_inputs(true, true);

		input1.checked = false;
		input1.dispatchEvent(changeEvent);
		flushSync();
		assert.deepEqual(component.test, ['b']);

		input2.checked = false;
		input2.dispatchEvent(changeEvent);
		flushSync();
		assert.deepEqual(component.test, []);

		input1.checked = true;
		input2.checked = true;
		input1.dispatchEvent(changeEvent);
		input2.dispatchEvent(changeEvent);
		flushSync();
		assert.deepEqual(component.test, ['a', 'b']);

		button.dispatchEvent(clickEvent);
		flushSync();
		assert.deepEqual(component.test, ['a', 'b']); // should it be ['a'] only? valid arguments for both outcomes

		input1.checked = false;
		input1.dispatchEvent(changeEvent);
		flushSync();
		assert.deepEqual(component.test, []);
	}
});
