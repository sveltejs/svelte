import { tick } from 'svelte';
import { test } from '../../test';

// The callback escapes a fork-created child. A real event invokes it while the
// real branch remains hidden, so the writer batch does not own/adopt that script.
// Its commit must carry the logical state edit into the original fork's fresh
// prefix instead of resetting the new n source to its declaration's zero.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, write, resolve_new, commit, resolve_old] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['init 0', 'load 0']);

		write.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['init 1', 'load 1']);

		resolve_new.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '', 'resolving the private fork cannot reveal it');
		assert.deepEqual(logs, []);

		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1|1|1</p>');
		assert.deepEqual(logs, []);
		const [node] = output.querySelectorAll('p');

		resolve_old.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1|1|1</p>');
		assert.equal(output.querySelector('p'), node);
		assert.deepEqual(logs, [], 'the old state source/result cannot revive its retired prefix');
	}
});
