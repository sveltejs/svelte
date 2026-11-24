import { tick } from 'svelte';
import { test } from '../../test';

// `getAbortSignal()` must be called before the first `await`, so that the signal belongs to the run in progress
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>get_abort_signal_after_await</p>');
	}
});
