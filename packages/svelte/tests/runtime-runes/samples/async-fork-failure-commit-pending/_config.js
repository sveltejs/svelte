import { tick } from 'svelte';
import { test } from '../../test';

// Commit is requested before the speculative request fails. With no explicit
// error boundary, the pending commit must reject with the eventual error rather
// than stay unresolved or leak an unhandled rejection outside the caller.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, commit, reject] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load']);

		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		reject.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['caught pending failure']);
	}
});
