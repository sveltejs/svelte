import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	skip_no_async: true,
	async test({ assert, target, logs }) {
		await tick();

		const [fork_btn, discard_btn, commit_btn, hide_btn] = target.querySelectorAll('button');
		const get_output = () => target.querySelector('output')?.textContent ?? '';

		assert.equal(get_output(), '1');
		assert.deepEqual(logs.splice(0), ['start', 1]);

		// Discarding the fork tears down speculative local derived subscriber 2 without affecting 1.
		fork_btn.click();
		await tick();
		assert.equal(get_output(), '1');
		assert.deepEqual(logs.splice(0), ['start', 2]);

		discard_btn.click();
		await tick();
		assert.equal(get_output(), '1');
		assert.deepEqual(logs.splice(0), ['stop', 2]);

		// Committing the fork promotes local derived subscriber 2 without destroying it on clear_effect_run.
		fork_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start', 2]);

		commit_btn.click();
		await tick();
		assert.equal(get_output(), '2');
		assert.deepEqual(logs.splice(0), ['stop', 1]);

		// Hiding unmounts and tears down the surviving local derived subscriber 2.
		hide_btn.click();
		await tick();
		assert.equal(get_output(), '');
		assert.deepEqual(logs.splice(0), ['stop', 2]);
	}
});
