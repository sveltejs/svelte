import { tick } from 'svelte';
import { test } from '../../test';

// Unlike the dependent chain, these expressions cannot read an uninitialized async
// source. The third await starts only after discard, in a shared script continuation.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, discard, real, shift, shift_second] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (const button of [fork, shift, real, discard]) {
			button.click();
			await tick();
		}
		// The real batch reruns the first await, then the second once the first resolves.
		assert.deepEqual(logs, [2, 3, 3]);

		// Resolve all subsequent work but leave the original fork's second await pending.
		for (let i = 0; i < 5; i++) {
			shift_second.click();
			await tick();
		}
		assert.htmlEqual(output.innerHTML, '<p>3 4 5</p>');
		assert.deepEqual(logs, [2, 3, 3, 4, 5]);

		shift.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>3 4 5</p>');
	}
});
