import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
	<button>pop</button>
`;

// Batch A creates a branch with `{await ...}` in it, batch B (which doesn't share a source with A) reveals it,
// too. B's run is done first: B creates the content in its own view, which undoes A's `x = 1`, and commits
// right away, without waiting for A. A adopts the content, and commits it in its own view once its run is done
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

		// B's run: B creates the content and commits
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p>`);
		assert.deepEqual(logs.splice(0), []);

		// A's run: A commits. (B has committed, so nothing runs the expression again)
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
