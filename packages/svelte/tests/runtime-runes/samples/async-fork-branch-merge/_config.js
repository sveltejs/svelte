import { flushSync, tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>preload</button>
	<button>increment</button>
	<button>commit</button>
	<button>merge</button>
	<button>resolve</button>
`;

export default test({
	async test({ assert, target, logs }) {
		const [preload, increment, commit, merge, resolve] = target.querySelectorAll('button');

		preload.click();
		flushSync(() => increment.click());
		assert.deepEqual(logs, [0, 1]); // [0] would also be ok; the 1 must be done in the context of the fork (impossible to assert so you gotta check manually)

		commit.click();
		assert.deepEqual(logs, [0, 1]);

		flushSync(() => merge.click());
		await tick();
		assert.deepEqual(logs, [0, 1]);
		assert.htmlEqual(target.innerHTML, buttons);

		// Resolve the obsolete request for 0, then the existing request for 1.
		resolve.click();
		resolve.click();
		await tick();
		assert.deepEqual(logs, [0, 1]);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p>`);
	}
});
