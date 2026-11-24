import { tick } from 'svelte';
import { test } from '../../test';

// The real batch adopts a component whose second script await started in a fork.
// Discarding the fork must not prevent the real results from completing the script.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, discard, real, shift, shift_second] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		shift.click();
		await tick();
		real.click();
		await tick();
		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs, [2, 3, 3]);

		// Leave the fork's unresolved held=3 request at the front of the queue.
		shift_second.click();
		await tick();
		assert.deepEqual(logs, [2, 3, 3, 4]);
		shift_second.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '4');
		assert.deepEqual(logs, [2, 3, 3, 4]);

		// A late result from the discarded fork must not replace the real value.
		shift.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '4');
		assert.deepEqual(logs, [2, 3, 3, 4]);
	}
});
