import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	html: `
		<input type="checkbox">
		<input type="checkbox">
		<input type="checkbox">
		0
	`,

	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		input.checked = true;
		input.dispatchEvent(new window.Event('change', { bubbles: true }));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<input type="checkbox">
			<input type="checkbox">
			<input type="checkbox">
			1
		`
		);
	}
});
