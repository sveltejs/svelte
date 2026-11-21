import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [fork, discard, commit, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, '1');
		assert.deepEqual(logs.splice(0), ['start 1', 'load 1']);

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '1');
		assert.deepEqual(logs.splice(0), ['start 2', 'load 2']);

		discard.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '1');
		assert.deepEqual(logs.splice(0), ['stop 2']);

		// Resolving discarded work must not revive its subscription.
		resolve.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);

		fork.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 2', 'load 2']);

		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '1');
		assert.deepEqual(logs.splice(0), []);

		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '2');
		assert.deepEqual(logs, ['stop 1']);
	}
});
