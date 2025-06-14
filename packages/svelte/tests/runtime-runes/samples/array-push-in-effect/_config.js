import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	/**
	 * Ensure that mutating an array with push inside an $effect
	 * does not cause an infinite re-execution loop.
	 */
	test({ assert, target }) {
		const button = target.querySelector('button');

		// initial render — effect should have run once
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>inc</button>
				<p>0</p>
			`
		);

		// increment count; effect should append one new entry only
		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>inc</button>
				<p>0</p>
				<p>1</p>
			`
		);
	}
}); 