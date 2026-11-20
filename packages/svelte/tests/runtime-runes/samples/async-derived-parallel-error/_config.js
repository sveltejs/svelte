import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [resolve_a, reject_b] = target.querySelectorAll('button');

		// `b` fails while `a` is still pending. This must not result in an unhandled rejection
		reject_b.click();
		await new Promise((r) => setTimeout(r, 10));
		await tick();
		assert.equal(target.querySelectorAll('output').length, 0);

		resolve_a.click();
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'b failed');
	}
});
