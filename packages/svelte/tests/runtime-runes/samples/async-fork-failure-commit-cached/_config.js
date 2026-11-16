import { tick } from 'svelte';
import { test } from '../../test';

// F's x=1 run fails, while the real batch succeeds with x=0 in the shared child.
// The real batch never writes x, so it does not supersede F's private failure.
// Committing F must surface that exact cached error without retrying load(1).
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, reject_fork, resolve_real, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 1']);

		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 0']);

		reject_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');
		assert.deepEqual(logs.splice(0), ['continued 0']);

		commit.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['onerror: original']);
		assert.htmlEqual(output.innerHTML, '<p>failed: fork failed</p>');
	}
});
