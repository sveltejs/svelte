import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>first 1</button>
	<button>first 2</button>
	<button>second 2</button>
`;

// Like `async-resume-script-later-batch`, but the script's second `await` uses `getAbortSignal`. Batch B writes the
// same source as A, so its view includes A's writes, and its run of the second expression supersedes A's, which is
// aborted. A can't continue with its own result anymore, so B takes over: the script continues in B's view once
// B's result is there (with A's `first`, as the first step continued with that). Otherwise A would wait for its
// aborted run, which only settles once B is merged into A — and B waits for the script to be done (it re-ran the
// first expression, whose step continued already)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, first_2, second_2] = target.querySelectorAll('button');

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 1']);

		// A's first result: the script continues in A's view
		first_1.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['second 1']);

		// B reveals the component, too, and runs both expressions. Its second run aborts A's
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['first 2', 'aborted second 1', 'second 2']);

		// B's second result: the script continues in B's view. B waits for its first result to commit
		second_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['continued with 1 2']);

		// B is done, and merged into A, which commits
		first_2.click();
		await tick();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
