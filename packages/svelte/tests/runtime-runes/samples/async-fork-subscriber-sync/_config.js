import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [fork, discard, commit, rebase, mode, toggle] = target.querySelectorAll('button');
		const output = () => target.querySelector('output')?.innerHTML;

		assert.equal(output(), '1');
		assert.deepEqual(logs.splice(0), ['start 1']);

		fork.click();
		await tick();
		assert.equal(output(), '1');
		assert.deepEqual(logs.splice(0), ['start 2']);

		// Real-world changes rebase the pending fork. Each view keeps its new subscription.
		rebase.click();
		await tick();
		assert.equal(output(), '11');
		assert.deepEqual(logs.splice(0).sort(), ['start 11', 'start 12', 'stop 1', 'stop 2']);

		discard.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['stop 12']);

		fork.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 12']);
		commit.click();
		await tick();
		assert.equal(output(), '12');
		assert.deepEqual(logs.splice(0), ['stop 11']);

		// Read directly in the key block instead of through a derived.
		mode.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		fork.click();
		await tick();
		assert.equal(output(), '12');
		assert.deepEqual(logs.splice(0), ['start 13']);
		discard.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['stop 13']);

		fork.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 13']);
		commit.click();
		await tick();
		assert.equal(output(), '13');
		assert.deepEqual(logs.splice(0), ['stop 12']);

		// Destroy the reader with a fork pending, then discard it and mount again.
		fork.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 14']);
		toggle.click();
		await tick();
		assert.equal(output(), undefined);
		assert.deepEqual(logs.splice(0).sort(), ['stop 13', 'stop 14']);
		discard.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		toggle.click();
		await tick();
		assert.equal(output(), '13');
		assert.deepEqual(logs.splice(0), ['start 13']);
	}
});
