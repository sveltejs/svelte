import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-resume-script-later-batch`, but the expressions use `getAbortSignal`. B folds A (both write `x`),
// so its runs supersede A's, which aborts them: A won't have a second value of its own. So B mustn't wait
// for A to continue the script (that would never happen). The script continues with B's second value, and
// once B is done, it's merged into A, which commits B's values
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, second_1, first_2, second_2] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		a.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['first 1']);

		first_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['second 1']);

		// B re-runs both expressions in its own view, which aborts A's runs
		b.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['first 2', 'second 2']);

		// A's second run was aborted, so the script continues with B's second value
		second_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['continued with 1 2']);

		// B is done, and merged into A, which commits
		first_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p>');
		assert.deepEqual(logs.splice(0), []);

		// (aborted, so this does nothing)
		second_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
