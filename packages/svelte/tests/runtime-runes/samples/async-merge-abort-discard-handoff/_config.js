import { flushSync, tick } from 'svelte';
import { test } from '../../test';

// A replacement run merges into the creator, moving its deferred there. Discarding
// that creator after a traversal error must release the surviving fork's buffered
// result, even though the deferred's original batch no longer holds it.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [update, fork, resolve_fork, fail_creator, commit_fork] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		update.click();
		await tick();
		fork.click();
		await tick();
		assert.deepEqual(logs, ['load 0', 'load 1', 'load 2']);

		resolve_fork.click();
		await tick();
		assert.deepEqual(logs, ['load 0', 'load 1', 'load 2']);

		let error = null;
		fail_creator.click();
		try {
			for (let i = 0; i < 10; i++) {
				await Promise.resolve();
				flushSync();
			}
		} catch (e) {
			error = e;
		}
		assert.match(/** @type {Error} */ (error)?.message, /^boom/);
		await tick();
		assert.deepEqual(logs, ['load 0', 'load 1', 'load 2', 'continued 2']);

		commit_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
	}
});
