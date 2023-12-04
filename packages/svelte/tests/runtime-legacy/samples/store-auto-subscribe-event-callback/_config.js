import { ok, test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: `
	<input class="input" placeholder="Type here" type="text">
	Dirty: false
	Valid: false
	`,

	test({ assert, target, window }) {
		const input = target.querySelector('input');
		ok(input);

		input.value = 'foo';
		const inputEvent = new window.InputEvent('input');

		flushSync(() => input.dispatchEvent(inputEvent));

		assert.htmlEqual(
			target.innerHTML,
			`
		<input class="input" placeholder="Type here" type="text">
		Dirty: true
		Valid: true
		`
		);
	}
});
