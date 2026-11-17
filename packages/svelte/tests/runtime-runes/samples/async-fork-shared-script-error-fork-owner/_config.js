import { tick } from 'svelte';
import { test } from '../../test';

// A fork creates the child, then the real batch adopts the same branch. Rejecting
// the fork's run must not permanently poison the shared script's initialization:
// the real batch still continues with its own successful result.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, reject_fork, resolve_real, discard, resolve_discarded] =
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

		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		// Committing real x=2 genuinely replaces F's failed x=1 input, so F
		// starts an independent replacement. This is not a commit-time retry.
		assert.deepEqual(logs.splice(0), ['continued 2', 'load 2']);

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs.splice(0), []);

		// The replacement belongs to the now-discarded fork, not the real view.
		resolve_discarded.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.deepEqual(logs, []);
	}
});
