import { tick } from 'svelte';
import { test } from '../../test';

// Two scripts in different batches await the same synchronous derived's promise.
// Aborting it must let both scripts continue with the replacement, not just the
// script in the batch that first evaluated the derived and owns its abort signal.
// Both initial batches write `revision`, so the second sees the first's `x = 1`.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [show_a, show_b, update, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		show_a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1']);
		assert.htmlEqual(output.innerHTML, '<span>0</span>');

		// A separate batch starts the second script, reusing the pending promise.
		show_b.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		assert.htmlEqual(output.innerHTML, '<span>0</span>');

		update.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['aborted 1', 'load 2']);
		assert.htmlEqual(output.innerHTML, '<span>0</span>');

		resolve.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['continued a 2', 'continued b 2']);
		assert.htmlEqual(output.innerHTML, '<span>2</span><p>a: 2</p><p>b: 2</p>');
	}
});
