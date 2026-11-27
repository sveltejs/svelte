import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	skip_no_async: true,
	async test({ assert, target, logs }) {
		const [fork_btn, commit_btn, discard_btn, hide_btn] = target.querySelectorAll('button');
		const get_output = () => target.querySelector('output')?.textContent ?? '';

		assert.equal(get_output(), 'item-1');
		assert.deepEqual(logs.splice(0), ['start 1', 'derive 1']);

		fork_btn.click();
		await tick();
		assert.equal(get_output(), 'item-1');
		assert.deepEqual(logs.splice(0), ['start 2', 'derive 2']);

		discard_btn.click();
		await tick();
		assert.equal(get_output(), 'item-1');
		assert.deepEqual(logs.splice(0), ['stop 2']);

		fork_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 2', 'derive 2']);

		commit_btn.click();
		await tick();
		assert.equal(get_output(), 'item-2');
		assert.deepEqual(logs.splice(0), ['stop 1']);

		// Disconnecting while a fork holds a recorded derived effect cleans up both.
		fork_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 3', 'derive 3']);

		hide_btn.click();
		await tick();
		assert.equal(get_output(), '');
		assert.deepEqual(logs.splice(0), ['stop 3', 'stop 2']);
	}
});
