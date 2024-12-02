import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
    <input>
	`,
	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		input.value = 'a';
		input.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			Display: a
		`
		);

		input.value = 'abc';
		input.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			Display: abc
		`
		);
	}
});
