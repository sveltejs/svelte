import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>up</button>
	<button>down</button>
	<button>show1</button>
	<button>show2</button>
	<button>shift a</button>
	<button>shift t</button>
`;

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [up, , show1, show2, shift_a, shift_t] = target.querySelectorAll('button');

		show1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>a: 0</p> <p>loading 1...</p>`);

		show2.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>a: 0</p> <p>loading 1...</p> <p>loading 2...</p>`
		);

		// batch A: writes a=1; the async-a effect re-runs in A. That's inside a boundary that shows its
		// pending snippet, so it doesn't block A, which commits — but stays linked until the run resolves
		up.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>a: 1</p> <p>loading 1...</p> <p>loading 2...</p>`
		);

		// The late reader's continuation (in the batch that showed it, which committed before A, and is
		// still linked as well) first-reads `a`. A's write is committed, so it's part of every view: the
		// reader sees 1. (Before, the view undid A's write, so boundary 1 showed `late read: 0` next to
		// `a: 1`, until the reader had re-run in A)
		shift_t.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>a: 1</p> <p>late read: 1</p> <p>loading 2...</p>`
		);

		// resolve the async-a runs (the first one was superseded by A's) -> boundary 2 shows A's result
		shift_a.click();
		await tick();
		shift_a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`${buttons} <p>a: 1</p> <p>late read: 1</p> <p>async a: 1</p>`
		);

		// the late reader didn't need to re-run
		assert.deepEqual(logs, ['push t 0', 'push a 0', 'push a 1']);
	}
});
