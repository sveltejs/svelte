import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ target }) {
		const fork = /** @type {HTMLElement} */ (target.querySelector('button'));

		// derived is first evaluated in block effect, then discarded
		flushSync(() => fork.click());

		// should not throw "Cannot convert a Symbol value to a string" due to cached UNINITIALIZED from first fork
		flushSync(() => fork.click());
	}
});
