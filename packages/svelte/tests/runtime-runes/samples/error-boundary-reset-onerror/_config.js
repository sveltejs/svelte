import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, warnings }) {
		const btn = target.querySelector('button');

		btn?.click();

		assert.throws(() => {
			flushSync();
		}, 'error on template render');

		// Check that the warning is being showed to the user
		assert.include(warnings[0], 'reset() was invoked');

		// boundary content empty; only button remains
		assert.htmlEqual(target.innerHTML, `<button>trigger throw</button>`);
	}
});
