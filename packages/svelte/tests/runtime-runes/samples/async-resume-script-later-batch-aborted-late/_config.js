import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-resume-script-later-batch-aborted`, but A's aborted promise rejects after B's second result
// arrives. B merges into A as soon as it aborts A's run, so the script can continue with B's value
// without waiting for the abandoned promise to reject.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, first_1, first_2, second_2, reject] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		a.click();
		await tick();
		first_1.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 1', 'second 1']);

		// B re-runs both expressions in its own view, which aborts A's runs
		b.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['first 2', 'second 2']);

		// The replacement result resumes the script even though A's promise hasn't rejected yet.
		second_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['continued with 1 2']);

		// The delayed rejection cannot resume the script again or affect the merged batch.
		reject.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		// The replacement first result allows the already-merged batch to commit.
		first_2.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2 2</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
