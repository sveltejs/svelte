import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_mode: ['client'],

	async test({ assert, target, hydrate }) {
		const inputs = /** @type {NodeListOf<HTMLInputElement>} */ (target.querySelectorAll('input'));
		const textarea = /** @type {HTMLTextAreaElement} */ (target.querySelector('textarea'));
		const buttons = target.querySelectorAll('button');

		inputs[0].value = 'direct';
		inputs[1].value = 'spread';
		inputs[2].value = 'nullable spread';
		inputs[2].setSelectionRange(1, 4);
		inputs[3].value = 'async direct';
		inputs[4].value = 'async spread';
		inputs[5].value = 'async with default';
		textarea.value = 'textarea';
		inputs[6].checked = true;
		inputs[7].checked = true;
		inputs[8].checked = true;

		hydrate();
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();

		assert.equal(inputs[0].value, 'direct');
		assert.equal(inputs[1].value, 'spread');
		assert.equal(inputs[2].value, 'nullable spread');
		assert.equal(inputs[2].selectionStart, 1);
		assert.equal(inputs[2].selectionEnd, 4);
		assert.equal(inputs[3].value, 'async direct');
		assert.equal(inputs[4].value, 'async spread');
		assert.equal(inputs[5].value, 'async with default');
		assert.equal(textarea.value, 'textarea');
		assert.equal(inputs[6].checked, true);
		assert.equal(inputs[7].checked, true);
		assert.equal(inputs[8].checked, true);

		buttons[0].click();
		flushSync();
		buttons[1].click();
		flushSync();
		buttons[1].click();
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();

		assert.equal(inputs[0].value, 'updated');
		assert.equal(inputs[1].value, 'updated');
		assert.equal(inputs[2].value, 'updated');
		assert.equal(inputs[3].value, 'updated');
		assert.equal(inputs[4].value, 'updated');
		assert.equal(inputs[5].value, 'updated');
		assert.equal(textarea.value, 'updated');
		assert.equal(inputs[6].checked, false);
		assert.equal(inputs[7].checked, false);
		assert.equal(inputs[8].checked, false);
	}
});
