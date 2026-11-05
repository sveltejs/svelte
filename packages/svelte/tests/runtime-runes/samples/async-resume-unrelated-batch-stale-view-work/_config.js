import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
`;

// Like `async-resume-unrelated-batch`, with `{#if b && !a}` next to the branch that A (`a = true`) created and
// B (`b = true`) reveals. Before B gets to the adopted branch's expression and folds A into its view (see
// `Batch#fold`), it processes the rest in its old view, where A's write is undone: `b && !a` holds there, so it
// creates the branch and runs its expression (`only b 0`). The block's stale selection stands until B is merged
// into A, so after the fold the expression runs again (`only b 1`, in the new view). Neither result is ever used.
// (On `main`, B doesn't fold A, and runs it once)
export default test({
	// TODO B does async work in its old view that's never used
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, shift] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['x 1']);

		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), []);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
