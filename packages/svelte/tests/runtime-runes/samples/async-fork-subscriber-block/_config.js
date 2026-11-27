import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	skip_no_async: true,
	async test({ assert, target, logs }) {
		const [fork_btn, commit_btn, discard_btn, notify1_btn, unmount_btn] =
			target.querySelectorAll('button');

		const get_output = () => target.querySelector('output')?.textContent ?? '';

		assert.equal(get_output(), '1:0');
		assert.deepEqual(logs.splice(0), ['start 1', 'read 1']);

		// Speculative fork subscribes to 2 once, does not freeze or stop 1.
		fork_btn.click();
		await tick();
		assert.equal(get_output(), '1:0');
		assert.deepEqual(logs.splice(0), ['start 2', 'read 2']);

		// Firing committed subscription 1's update updates committed branch without re-running the fork.
		notify1_btn.click();
		await tick();
		assert.equal(get_output(), '1:1');
		assert.deepEqual(logs.splice(0), ['read 1']);

		// Discarding tears down subscription 2 while committed subscription 1 stays alive.
		discard_btn.click();
		await tick();
		assert.equal(get_output(), '1:1');
		assert.deepEqual(logs.splice(0), ['stop 2']);

		// Fork and commit transitions cleanly from subscription 1 to subscription 2.
		fork_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 2', 'read 2']);

		commit_btn.click();
		await tick();
		assert.equal(get_output(), '2:1');
		assert.deepEqual(logs.splice(0), ['stop 1']);

		// Fork again (now id = 3), then unmount while fork is still pending: both active subscriptions clean up.
		fork_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 3', 'read 3']);

		unmount_btn.click();
		await tick();
		assert.equal(get_output(), '');
		assert.deepEqual(logs.splice(0), ['stop 2', 'stop 3']);
	}
});
