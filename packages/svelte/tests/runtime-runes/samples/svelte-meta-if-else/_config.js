import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<p>before</p><p>during</p><p>after</p>`,

	async test({ target, assert }) {
		const ps = target.querySelectorAll('p');

		// @ts-expect-error
		assert.deepEqual(ps[0].__svelte_meta.loc, {
			file: 'main.svelte',
			line: 1,
			column: 0
		});

		// @ts-expect-error
		assert.deepEqual(ps[1].__svelte_meta.loc, {
			file: 'main.svelte',
			line: 6,
			column: 1
		});

		// @ts-expect-error
		assert.deepEqual(ps[2].__svelte_meta.loc, {
			file: 'main.svelte',
			line: 11,
			column: 0
		});
	}
});
