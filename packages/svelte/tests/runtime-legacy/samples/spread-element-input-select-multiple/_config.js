import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, component, target, window }) {
		const [input1, input2] = target.querySelectorAll('input');
		const select = target.querySelector('select');
		ok(select);
		const [option1, option2] = /** @type {NodeListOf<HTMLOptionElement>} */ (select.childNodes);

		let selections = Array.from(select.selectedOptions);
		assert.equal(selections.length, 2);
		assert.ok(selections.includes(option1));
		assert.ok(selections.includes(option2));

		const event = new window.Event('change');

		input1.checked = false;
		input1.dispatchEvent(event);
		flushSync();

		selections = Array.from(select.selectedOptions);
		assert.equal(selections.length, 1);
		assert.ok(!selections.includes(option1));
		assert.ok(selections.includes(option2));

		input2.checked = false;
		input2.dispatchEvent(event);
		flushSync();
		input1.checked = true;
		input1.dispatchEvent(event);
		flushSync();
		selections = Array.from(select.selectedOptions);
		assert.equal(selections.length, 1);
		assert.ok(selections.includes(option1));
		assert.ok(!selections.includes(option2));

		component.spread = { value: ['Hello', 'World'] };

		selections = Array.from(select.selectedOptions);
		assert.equal(selections.length, 2);
		assert.ok(selections.includes(option1));
		assert.ok(selections.includes(option2));
	}
});
