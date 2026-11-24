import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	// the promise never resolves, so there is nothing to server-render
	mode: ['client'],
	skip_no_async: true,
	compileOptions: {
		dev: true
	},

	async test({ target, assert }) {
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<section>loading</section><p>after</p>');

		const [p] = output.querySelectorAll('p');

		// The raw `pending` snippet's root has no location of its own,
		// so it must not take the location of the following element
		// @ts-expect-error
		assert.deepEqual(p.__svelte_meta?.loc, { file: 'main.svelte', line: 13, column: 1 });
	}
});
