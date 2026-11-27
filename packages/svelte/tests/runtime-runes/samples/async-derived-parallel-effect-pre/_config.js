import { tick } from 'svelte';
import { test } from '../../test';

// Unlike `$effect`, `$effect.pre` runs right away, so `result` must not be created before it.
// (No comments inside the script: they must not affect hoisting, so they'd make this test weaker)
export default test({
	// effects don't run on the server
	mode: ['client'],
	async test({ assert, target }) {
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '42');
	}
});
