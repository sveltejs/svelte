import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>show</button><button>items</button><button>shift</button>';
/** @param {number} offset */
const list = (offset) => Array.from({ length: 2000 }, (_, i) => `${i + offset},`).join('');

// When the branch is created in B1, the each block reads all 2000 items, each of which B2 holds
// a newer value of. The each block must be scheduled to re-run in B2 once, not once per stale
// value — otherwise B2 is flushed 2000 times (each flush being O(size of B2)), which takes seconds
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [show, items, shift] = target.querySelectorAll('button');

		// B1: show = true -> pending
		show.click();
		await tick();

		// B2: increment all items -> pending
		items.click();
		await tick();

		// B1 resolves -> the branch is created, reading 2000 values that are stale relative to B2
		const start = performance.now();
		shift.click();
		await tick();
		const duration = performance.now() - start;

		assert.ok(duration < 1000, `took ${duration}ms`);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><div>${list(0)}</div>`);

		// B2 resolves
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><div>${list(1)}</div>`);
	}
});
