import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>a</button> <button>shift r1</button> <button>shift r2</button> <button>pop r2</button>';

// When a write in a batch marks an async expression that already ran in that batch (here: the result of
// another async expression it reads), its next run in the batch still supersedes the previous one
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [a, shift_r1, shift_r2, pop_r2] = target.querySelectorAll('button');
		assert.htmlEqual(target.innerHTML, `${buttons} <p>0/0</p>`);

		a.click();
		await tick();
		assert.deepEqual(logs, ['r1 1', 'r2 1/0']);

		// r1 resolves in the batch -> r2 re-runs with it, which supersedes the run that read r1 = 0
		shift_r1.click();
		await tick();
		assert.deepEqual(logs, ['r1 1', 'r2 1/0', 'r2 1/1']);

		// the batch doesn't wait for the superseded run (resolves r2's latest run, `1/1`)
		pop_r2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>1/1</p>`);

		// which doesn't overwrite the result once it resolves (resolves the superseded run, `1/0`)
		shift_r2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} <p>1/1</p>`);
	}
});
