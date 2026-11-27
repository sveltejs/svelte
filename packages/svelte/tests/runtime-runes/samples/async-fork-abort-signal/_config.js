import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	skip_no_async: true,
	async test({ assert, target, logs }) {
		await tick();

		const [fork_btn, discard_btn, unmount_btn] = target.querySelectorAll('button');
		const get_output = () => target.querySelector('output')?.textContent ?? '';

		assert.equal(get_output(), '1');
		assert.deepEqual(logs.splice(0), ['start', 1]);

		// Fork creates a recorded child effect with its own AbortSignal without aborting committed run 1.
		fork_btn.click();
		await tick();
		assert.equal(get_output(), '1');
		assert.deepEqual(logs.splice(0), ['start', 2]);

		// Discarding the fork aborts and tears down run 2 without disturbing run 1.
		discard_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['abort', 2, 'stop', 2]);

		// Fork again and unmount the parent block while fork is pending: both committed and recorded signals abort.
		fork_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start', 2]);

		unmount_btn.click();
		await tick();
		assert.equal(get_output(), '');
		assert.deepEqual(logs.splice(0), ['abort', 1, 'abort', 2, 'stop', 1, 'stop', 2]);
	}
});
