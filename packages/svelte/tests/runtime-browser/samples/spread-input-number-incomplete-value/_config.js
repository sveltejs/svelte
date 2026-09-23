import { flushSync } from 'svelte';
import { ok, test } from '../../assert';

export default test({
	async test({ assert, target }) {
		const input = target.querySelector('input');
		ok(input);

		input.focus();

		document.execCommand('insertText', false, '250');
		flushSync();
		document.execCommand('insertText', false, '.');
		flushSync();

		assert.equal(input.value, '');
		assert.equal(input.validity.badInput, true);

		document.execCommand('insertText', false, '5');
		flushSync();

		assert.equal(input.value, '250.5');
	}
});
