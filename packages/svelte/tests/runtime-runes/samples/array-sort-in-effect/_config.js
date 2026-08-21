import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	/**
	 * Ensure that sorting an array inside an $effect works correctly
	 * and re-runs when the array changes (e.g., when items are added).
	 */
	test({ assert, target }) {
		const button = target.querySelector('button');

		// initial render — array should be sorted
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add item</button>
				<p>0</p>
				<p>50</p>
				<p>100</p>
			`
		);

		// add first item (20); effect should re-run and sort the array
		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add item</button>
				<p>0</p>
				<p>20</p>
				<p>50</p>
				<p>100</p>
			`
		);

		// add second item (80); effect should re-run and sort the array
		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>add item</button>
				<p>0</p>
				<p>20</p>
				<p>50</p>
				<p>80</p>
				<p>100</p>
			`
		);
	}
});
