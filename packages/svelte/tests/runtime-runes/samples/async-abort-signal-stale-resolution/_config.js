import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>increment</button>
	<button>shift</button>
`;

// Resolving a promise whose run was aborted must not restart anything: the run it belonged to
// has been superseded, and its result is not used
export default test({
	// TODO deciding what should happen here: the promise belongs to the run in an earlier batch,
	// which the later batches superseded. Resolving it currently re-processes that batch, which
	// re-runs the block (`started 1`) and then the later batches (`aborted 1`, `started 2`)
	skip: true,
	mode: ['client'],
	async test({ assert, target, logs }) {
		// (the sample resolves the first promise in a `setTimeout`, like the playground example)
		await new Promise((resolve) => setTimeout(resolve));
		await tick();

		const [increment, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>true</p>`);
		assert.deepEqual(logs.splice(0), ['started 0']);

		increment.click();
		await tick();
		increment.click();
		await tick();
		increment.click();
		await tick();
		assert.deepEqual(logs.splice(0), [
			'aborted 0',
			'started 1',
			'aborted 1',
			'started 2',
			'aborted 2',
			'started 3'
		]);

		shift.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
	}
});
