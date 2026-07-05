import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {number[]} */
let torn = [];

export default test({
	props: {
		items: [1, 2, 3, 4],
		onteardown: (/** @type {number} */ item) => torn.push(item)
	},

	test({ assert, component }) {
		torn.length = 0;

		// remove every item at once. the each block destroys the removed items in a loop
		// (`destroy_effects`); each item's `$effect` teardown throws. before #18415 the
		// first throw aborted that loop, stranding the items queued after it — they stayed
		// subscribed to their dependencies and retained their detached DOM. now the whole
		// loop completes and the first teardown error is surfaced once.
		component.items = [];

		/** @type {unknown} */
		let thrown;
		try {
			flushSync();
		} catch (error) {
			thrown = error;
		}

		assert.isDefined(thrown, 'the teardown error should still surface');
		assert.deepEqual(
			[...torn].sort((a, b) => a - b),
			[1, 2, 3, 4],
			'every removed item tore down despite a throwing teardown'
		);
	}
});
