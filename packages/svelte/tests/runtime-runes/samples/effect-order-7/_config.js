import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// For this to work in non-async mode, we would need to abort
	// inside `#traverse_effect_tree`, which would be very
	// complicated and annoying. Since this hasn't been
	// a real issue (AFAICT), we ignore it
	skip_no_async: true,

	async test({ target }) {
		const [open, close] = target.querySelectorAll('button');

		flushSync(() => open.click());

		// if the effect queue isn't aborted after the state change, this will throw
		flushSync(() => close.click());
	}
});
