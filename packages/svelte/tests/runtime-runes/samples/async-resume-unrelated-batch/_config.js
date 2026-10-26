import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
`;

// Batch A creates a branch with `{await ...}` in it, batch B (which doesn't share a source with A) reveals it,
// too. B doesn't run the expression: run in its view, which undoes A's `x = 1`, it would make B intersect with A
// (they'd both have run it), so A's writes would be part of B's view from then on, and the run outdated right
// away. Instead, B folds A into its view before it would run it (see `Batch#fold`), A's run applies there, and
// B is merged into A. The content is created with A's result, and committed with both batches' writes.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, shift] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs, ['push 1']);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs, ['push 1']);
	}
});
