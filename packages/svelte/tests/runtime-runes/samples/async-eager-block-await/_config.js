import { tick } from 'svelte';
import { test } from '../../test';

// We rerun block effects eagerly during effect flushing if they get triggered by an effect to see which
// subsequent effects become obsolete (here, the effect sets `indirect` when `trigger` changes). But they
// must only be determined (which to skip), not commit the actual DOM of that block effect (to e.g. prevent
// tearing if they have an `await` inside).
export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const [indirect, direct, shift] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('#output');

		indirect.click();
		assert.htmlEqual(output.innerHTML, '');

		await tick();
		assert.htmlEqual(output.innerHTML, '');

		direct.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');

		// resolve both awaits
		shift.click();
		await tick();

		assert.htmlEqual(output.innerHTML, '<p>indirect</p><p>hello</p>');
		shift.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>indirect</p><p>hello</p><p>direct</p><p>hello</p>');
	}
});
