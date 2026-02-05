import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		const event = new window.Event('input');
		input.value = 'changed';
		input.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>changed</p>
		`
		);
	}
});
