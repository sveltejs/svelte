import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>shift</button>
	<button>pop</button>
`;

// Like `async-resume-unrelated-batch`, with `getAbortSignal`: B's run of the expression mustn't abort A's. B's view
// undoes A's writes, so A's run still applies in A's view (see `supersedes`). If it was aborted, it would never
// settle, and A would never commit
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, shift, pop] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['load 1', 'load 0']);

		// B's run: B creates the content and commits
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0</p>`);
		assert.deepEqual(logs.splice(0), []);

		// A's run: A commits
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1</p>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
