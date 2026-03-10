import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	/**
	 * Regression test for #17891
	 * A getter that lazily writes $state on first read should not deadlock
	 * the scheduler when read during the flush/commit phase.
	 */
	test({ assert, target }) {
		const [openBtn, closeBtn, counterBtn] = target.querySelectorAll('button');

		// initial state
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Open</button>
				<button>Close</button>
				<button>Counter: 0</button>
				<div class="panel">closed</div>
			`
		);

		// open the panel - this triggers the lazy $state write in the getter
		flushSync(() => openBtn?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Open</button>
				<button>Close</button>
				<button>Counter: 0</button>
				<div class="panel" style="width: 420px;">open (width: 420)</div>
			`
		);

		// increment counter - this should work (scheduler should not be deadlocked)
		flushSync(() => counterBtn?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Open</button>
				<button>Close</button>
				<button>Counter: 1</button>
				<div class="panel" style="width: 420px;">open (width: 420)</div>
			`
		);

		// close the panel
		flushSync(() => closeBtn?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Open</button>
				<button>Close</button>
				<button>Counter: 1</button>
				<div class="panel">closed</div>
			`
		);
	}
});
