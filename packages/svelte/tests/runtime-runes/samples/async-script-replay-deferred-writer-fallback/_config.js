import { settled, tick } from 'svelte';
import { test } from '../../test';

// A Promise callback is not currently covered by initializer write provenance.
// Default compilation must retain the old lowering for this detectable shape,
// rather than repeatedly treating its own completion write as external input.
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		await settled();
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '1 / 42 / 1');
	}
});
