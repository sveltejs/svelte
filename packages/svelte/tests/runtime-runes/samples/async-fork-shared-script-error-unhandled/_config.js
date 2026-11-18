import { tick } from 'svelte';
import { test } from '../../test';

// There is no explicit error boundary. A speculative script error must not escape
// to the implicit root before commit. Discarding the fork must leave the adopting
// real batch healthy, and prevent the failed fork from ever being committed.
// Unexpected unhandled rejections are checked by the runtime suite itself.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, reject_fork, discard, commit_discarded, resolve_real] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 1']);

		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 2']);

		reject_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		commit_discarded.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['fork_discarded']);

		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs.splice(0), ['continued 2']);
	}
});
