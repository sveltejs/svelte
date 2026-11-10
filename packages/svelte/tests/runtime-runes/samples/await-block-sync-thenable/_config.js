import { flushSync } from 'svelte';
import { test } from '../../test';

// A thenable that settles synchronously resolves while the `{#await}` block is still being created
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [show] = target.querySelectorAll('button');

		flushSync(() => show.click());
		assert.htmlEqual(target.innerHTML, '<button>show</button><p>ok</p>');
	}
});
