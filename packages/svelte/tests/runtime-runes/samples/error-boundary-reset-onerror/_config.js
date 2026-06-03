import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();

		assert.throws(flushSync, 'svelte_boundary_reset_onerror');

		// boundary content empty; only button remains
		assert.htmlEqual(target.innerHTML, `<button>trigger throw</button>`);
	}
});
