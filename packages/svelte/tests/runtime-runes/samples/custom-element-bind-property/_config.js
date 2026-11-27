import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [toggle] =
			/** @type {NodeListOf<HTMLElement & { isPressed: boolean, toggle(): void }>} */ (
				target.querySelectorAll('x-toggle')
			);
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, 'false');

		// element -> state, through the `isPressedchange` event
		flushSync(() => toggle.toggle());
		assert.equal(toggle.isPressed, true);
		assert.htmlEqual(output.innerHTML, 'true');

		// state -> element, through the `isPressed` property
		flushSync(() => button.click());
		assert.equal(toggle.isPressed, false);
		assert.equal(toggle.textContent, 'off');
		assert.htmlEqual(output.innerHTML, 'false');

		flushSync(() => toggle.toggle());
		assert.htmlEqual(output.innerHTML, 'true');
	}
});
