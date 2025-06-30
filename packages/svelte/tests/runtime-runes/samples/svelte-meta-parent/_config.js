import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: {
		dev: true
	},
	html: `<p>no parent</p><p>if</p><p>each</p><p>loading</p><p>key</p><p>hi</p><p>hi</p><p>hi</p>`,

	async test({ target, assert }) {
		await tick();
		const [main, if_, each, await_, key, child1, child2, child3] = target.querySelectorAll('p');

		// @ts-expect-error
		assert.deepEqual(main.__svelte_meta.parent, null);

		// @ts-expect-error
		assert.deepEqual(if_.__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'if',
			line: 10,
			column: 0,
			parent: null
		});

		// @ts-expect-error
		assert.deepEqual(each.__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'each',
			line: 14,
			column: 0,
			parent: null
		});

		// @ts-expect-error
		assert.deepEqual(await_.__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'await',
			line: 18,
			column: 0,
			parent: null
		});

		// @ts-expect-error
		assert.deepEqual(key.__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'key',
			line: 24,
			column: 0,
			parent: null
		});

		// @ts-expect-error
		assert.deepEqual(child1.__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'component',
			componentTag: 'Child',
			line: 28,
			column: 0,
			parent: null
		});

		// @ts-expect-error
		assert.deepEqual(child2.__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'component',
			componentTag: 'Child',
			line: 31,
			column: 1,
			parent: {
				file: 'main.svelte',
				type: 'component',
				componentTag: 'Passthrough',
				line: 30,
				column: 0,
				parent: null
			}
		});

		// @ts-expect-error
		assert.deepEqual(child3.__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'component',
			componentTag: 'x.y',
			line: 34,
			column: 0,
			parent: null
		});
	}
});
