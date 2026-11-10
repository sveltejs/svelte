import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
	<button>pop</button>
`;

// Batch A creates a branch with `{await ...}` in it, batch B (which doesn't share a source with A) reveals it,
// too. The content is created with A's result, in A's view, even though B's run is done first: B waits for
// that, and then re-validates the content in its own view. Before, B committed the branch without the content,
// as it didn't wait for it — only A did
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, shift, pop] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		// B runs the expression in its own view, which undoes A's `x = 1`
		assert.deepEqual(logs.splice(0), ['push 1', 'push 0']);

		// B's run
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), []);

		// A's run: A creates the content and commits. Its `x = 1` is part of B's view now, so B runs it again
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['push 1']);

		// B commits
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
