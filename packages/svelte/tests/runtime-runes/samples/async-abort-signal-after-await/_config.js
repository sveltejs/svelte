import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>c</button>
	<button>a</button>
	<button>shift</button>
	<button>pop</button>
`;

// Test that different worlds don't interfere in respect of their abort signals, in the variant where
// the signal is requested after an `await` (`load('x', await ..., getAbortSignal())`).
//
// TODO the signal can't be attributed to the run when it's requested after an `await`: it's the
// effect's, which the next run of any batch aborts. So B's run aborts A's, which never settles, and A
// never commits. (On `main`, B doesn't run the expression at all, but commits the branch without its
// content.) This needs the `run`/`flatten` work that lives on `batch-views-run-flatten`
export default test({
	// TODO see above
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [c, a, shift, pop] = target.querySelectorAll('button');
		assert.deepEqual(logs.splice(0), ['c 0', 'commit c=0 a=false x=0']);

		c.click();
		await tick();
		a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['c 1', 'x 1']);

		// B's `c` result: B reveals the branch, and runs the expression — which mustn't abort A's run
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['x 0']);

		// B's run: B waits for the content, which is created with A's result
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), []);

		// A's run
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['commit c=1 a=false x=0', 'commit c=1 a=true x=1']);
	}
});
