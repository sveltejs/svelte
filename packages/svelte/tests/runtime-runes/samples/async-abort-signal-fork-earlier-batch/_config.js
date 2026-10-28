import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>c</button>
	<button>commit</button>
	<button>a</button>
	<button>shift</button>
	<button>pop</button>
`;

// Like `async-resume-abort-signal-earlier-batch`, but the earlier batch that reveals the branch is a fork. It runs
// the expression in its own view, which doesn't abort A's run: a fork's run only aborts the fork's own (see
// `abort_replaced`).
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [c, commit, a, shift, pop] = target.querySelectorAll('button');
		assert.deepEqual(logs.splice(0), ['c 0', 'commit c=0 a=false x=0']);

		c.click();
		await tick();
		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['c 1', 'x 1']);

		// the fork's `c` result: the fork reveals the branch, and runs the expression in its own view
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['x 0']);

		// the fork's run
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), []);

		// A's run: A commits, and the fork, whose view changed, runs the expression again
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['commit c=0 a=true x=1', 'aborted x 0', 'x 1']);

		commit.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['commit c=1 a=true x=1']);
	}
});
