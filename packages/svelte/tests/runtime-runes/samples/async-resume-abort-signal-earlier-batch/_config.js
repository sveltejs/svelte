import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>c</button>
	<button>a</button>
	<button>shift</button>
	<button>pop</button>
`;

// Like `async-resume-abort-signal-unrelated-batch`, but the batch that reveals the branch (B, which sets `c`) is
// the earlier one.
export default test({
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

		// B's `c` result: B reveals the branch, and runs the expression in its own view
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['x 0']);

		// B's run: B waits for the content, which is created with A's result
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), []);

		// A's run: the content is created, B commits it in its view, then A in its own
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['commit c=1 a=false x=0', 'commit c=1 a=true x=1']);
	}
});
