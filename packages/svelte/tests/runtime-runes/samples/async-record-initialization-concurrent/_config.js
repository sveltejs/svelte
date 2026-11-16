import { tick } from 'svelte';
import { test } from '../../test';

// The second async derived starts after the creating batch committed, while an
// unrelated batch is still pending. Its view has overrides, but none for `count`.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [background, first, bump, resolve_old, resolve_latest, finish_background] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		background.click();
		await tick();
		first.click();
		await tick();
		assert.deepEqual(logs, [0]);

		bump.click();
		await tick();
		assert.deepEqual(logs, [0, 1]);
		resolve_latest.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>one 1</p>');

		// A superseded promise resolving afterward must not overwrite the current value.
		resolve_old.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>one 1</p>');

		finish_background.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>one 1</p><i>1</i>');
		assert.deepEqual(logs, [0, 1]);
	}
});
