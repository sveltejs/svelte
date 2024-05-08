import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<button>toggle</button><p>before</p><p>after</p>`,

	async test({ target, assert }) {
		const btn = target.querySelector('button');
		const ps = target.querySelectorAll('p');

		// @ts-expect-error
		assert.deepEqual(ps[0].__svelte_meta.loc, {
			filename: '.../samples/svelte-meta-dynamic/main.svelte',
			line: 7,
			column: 0
		});

		// @ts-expect-error
		assert.deepEqual(ps[1].__svelte_meta.loc, {
			filename: '.../samples/svelte-meta-dynamic/main.svelte',
			line: 13,
			column: 0
		});

		flushSync(() => btn?.click());

		const strong = target.querySelector('strong');

		// @ts-expect-error
		assert.deepEqual(strong.__svelte_meta.loc, {
			filename: '.../samples/svelte-meta-dynamic/main.svelte',
			line: 10,
			column: 1
		});
	}
});
