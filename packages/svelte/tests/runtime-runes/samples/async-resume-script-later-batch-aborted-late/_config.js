import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>a</button>
	<button>b</button>
	<button>first 1</button>
	<button>first 2</button>
	<button>second 2</button>
	<button>reject</button>
`;

// Like `async-resume-script-later-batch-aborted`, but the aborted run's promise only rejects after B's second
// result is in. Until then, the script waits for A, also in B's view. Once the rejection says that A won't have
// a second value of its own, the script continues with B's
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, first_2, second_2, reject] = target.querySelectorAll('button');

		a.click();
		await tick();
		first_1.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 1', 'second 1']);

		// B re-runs both expressions in its own view, which aborts A's runs
		b.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 2', 'second 2']);

		// A's run was aborted, but its promise hasn't rejected yet, so the script still waits for A
		second_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), []);

		reject.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['continued with 1 2']);

		// B is done, and merged into A, which commits without continuing the script again
		first_2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2 2</p>`);
		assert.deepEqual(logs.splice(0), []);
	}
});
