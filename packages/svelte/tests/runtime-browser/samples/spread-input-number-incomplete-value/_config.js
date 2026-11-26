import { flushSync } from 'svelte';
import { ok, test } from '../../assert';

export default test({
	async test({ assert, target }) {
		const input = target.querySelector('input');
		ok(input);

		input.focus();

		// we need to use `document.execCommand('insertText', false, ...)` to simulate user input
		// because directly setting an invalid value to `input.value` would simply clear the input
		// and dispatching an event would not update the input correctly
		document.execCommand('insertText', false, '1');
		flushSync();
		// `1e` is incomplete on every platform, unlike `1.` which Chromium on Linux accepts as `1`
		document.execCommand('insertText', false, 'e');
		flushSync();

		assert.equal(input.value, '');
		assert.equal(input.validity.badInput, true);

		document.execCommand('insertText', false, '5');
		flushSync();

		assert.equal(input.value, '1e5');
	}
});
