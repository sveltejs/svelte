import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const input = target.querySelector('input');

		input?.dispatchEvent(new Event('input', { bubbles: true }));
		flushSync();

		assert.htmlEqual(target.innerHTML, 'true <input class="hello">');
	}
});
