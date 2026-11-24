import { tick } from 'svelte';
import { test } from '../../test';

// A fork re-runs the only `await` inside a pending boundary and resolves last. The real result must reveal
// the content and run deferred effects without waiting for the fork. Completing and discarding the fork
// afterwards must neither steal those effects nor run them again.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, discard, shift] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');

		fork.click();
		await tick();

		// the real world's run reveals the boundary without waiting for speculative work
		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');
		assert.deepEqual(logs, ['effect ran']);

		// the fork's run
		shift.click();
		await tick();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');
		assert.deepEqual(logs, ['effect ran']);

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');
		assert.deepEqual(logs, ['effect ran']);
	}
});
