import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-update-during-first-render`, but the update's run of the expression aborts the run of the batch that
// created it, which therefore won't get a value of its own. The script continues with the update's value instead, and
// the update is merged into the creating batch (their writes don't intersect), so that the creating batch is done, too
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [bump, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		bump.click();
		await tick();
		assert.deepEqual(logs, [0, 'aborted 0', 1]);

		resolve.click();
		await tick();

		assert.htmlEqual(output.innerHTML, '<p>one 1</p>');
		assert.deepEqual(logs, [0, 'aborted 0', 1]);
	}
});
