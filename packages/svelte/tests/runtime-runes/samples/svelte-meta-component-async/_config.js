import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	compileOptions: { dev: true },
	async test({ target, assert }) {
		await tick();
		const loc = (/** @type {any} */ el) => el.__svelte_meta?.loc;
		assert.deepEqual(loc(target.querySelector('h1')), { file: 'main.svelte', line: 5, column: 0 });
		assert.deepEqual(loc(target.querySelector('section')), {
			file: 'Child.svelte',
			line: 5,
			column: 0
		});
		assert.deepEqual(loc(target.querySelector('p')), { file: 'main.svelte', line: 7, column: 0 });
		assert.deepEqual(loc(target.querySelector('b')), { file: 'main.svelte', line: 8, column: 0 });
		assert.deepEqual(loc(target.querySelector('i')), { file: 'main.svelte', line: 9, column: 0 });
	}
});
