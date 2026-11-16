import { tick } from 'svelte';
import { test } from '../../test';

// With no explicit failed/onerror boundary, a fork's script error must remain
// speculative until commit. Awaiting commit must reject with the original error,
// rather than leaking an unhandled rejection or silently reporting success.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [fork, reject, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load']);

		reject.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), []);

		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		// The handler compares error identity, not just its message.
		assert.deepEqual(logs.splice(0), ['caught fork failure']);
	}
});
