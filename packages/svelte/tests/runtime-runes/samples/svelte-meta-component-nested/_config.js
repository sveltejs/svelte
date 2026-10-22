import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	test({ target, assert }) {
		/** @type {[string, number, number][]} */
		const child_locations = [
			['section', 1, 0],
			['article', 2, 0],
			['i', 2, 9]
		];
		for (const [selector, line, column] of child_locations) {
			const elements = target.querySelectorAll(selector);
			assert.equal(elements.length, 5);
			for (const element of elements) {
				// @ts-expect-error
				assert.deepEqual(element.__svelte_meta.loc, { file: 'Component.svelte', line, column });
			}
		}

		const ps = target.querySelectorAll('p');
		for (const [index, line, column] of [
			[0, 8, 1],
			[1, 13, 0],
			[2, 16, 0],
			[3, 20, 1]
		]) {
			// @ts-expect-error
			assert.deepEqual(ps[index].__svelte_meta.loc, { file: 'main.svelte', line, column });
		}

		// @ts-expect-error
		assert.deepEqual(target.querySelector('strong').__svelte_meta, {
			parent: null,
			loc: { file: 'main.svelte', line: 8, column: 4 }
		});
		// @ts-expect-error
		assert.deepEqual(ps[3].__svelte_meta.parent, {
			file: 'main.svelte',
			type: 'render',
			line: 22,
			column: 0,
			parent: null
		});
	}
});
