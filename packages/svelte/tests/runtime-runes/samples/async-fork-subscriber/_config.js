import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	skip_no_async: true,
	async test({ assert, target, logs }) {
		await tick();

		const [output] = target.querySelectorAll('output');
		const [fork_btn, commit_btn, discard_btn, resolve_btn] = target.querySelectorAll('button');

		assert.equal(output.textContent, '1');
		assert.deepEqual(logs.splice(0), ['start 1', 'load 1']);

		fork_btn.click();
		await tick();

		// The fork starts subscription 2 and load(2) once, without stopping subscription 1 or restarting load(1).
		assert.equal(output.textContent, '1');
		assert.deepEqual(logs.splice(0), ['start 2', 'load 2']);

		// Resolving the forked load while still uncommitted must not restart anything.
		resolve_btn.click();
		await tick();
		assert.equal(output.textContent, '1');
		assert.deepEqual(logs.splice(0), []);

		// Discarding tears down speculative subscription 2 while committed subscription 1 stays alive.
		discard_btn.click();
		await tick();
		assert.equal(output.textContent, '1');
		assert.deepEqual(logs.splice(0), ['stop 2']);

		// Re-fork and commit: transitions from subscription 1 to subscription 2 cleanly.
		fork_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 2', 'load 2']);

		resolve_btn.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);

		commit_btn.click();
		await tick();
		assert.equal(output.textContent, '2');
		assert.deepEqual(logs.splice(0), ['stop 1']);
	}
});
