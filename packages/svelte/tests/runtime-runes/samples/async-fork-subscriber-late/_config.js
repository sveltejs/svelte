import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [fork, discard, commit, resolve, toggle] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, '1');
		assert.deepEqual(logs.splice(0), ['start 1']);

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '1');
		assert.deepEqual(logs.splice(0), []);

		discard.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);

		// A discarded continuation must not establish a subscription after it resumes.
		resolve.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);

		fork.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		resolve.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['start 2']);

		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '2');
		assert.deepEqual(logs.splice(0), ['stop 1']);

		// Neither may a continuation whose owning effect has been destroyed.
		fork.click();
		await tick();
		toggle.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['stop 2']);
		resolve.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		discard.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
	}
});
