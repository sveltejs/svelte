import { flushSync } from 'svelte';
import { ok, test } from '../../test';

// $$props reactivity in slot fallback
export default test({
	html: `
		<input>
		{"value":""}
	`,
	ssrHtml: `
		<input value="">
		{"value":""}
	`,

	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		input.value = 'abc';
		input.dispatchEvent(new window.Event('input'));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			{"value":"abc"}
		`
		);
	}
});
