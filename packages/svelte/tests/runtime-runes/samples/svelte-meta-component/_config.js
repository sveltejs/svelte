import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ target, assert }) {
		/** @param {Element} element */
		// @ts-expect-error
		const loc = (element) => element.__svelte_meta?.loc;

		for (const section of target.querySelectorAll('section')) {
			assert.deepEqual(loc(section), { file: 'Card.svelte', line: 1, column: 0 });
		}

		/** @type {Array<[string, string, number, number]>} */
		const expected = [
			['h1', 'main.svelte', 6, 0],
			['p', 'main.svelte', 8, 0],
			['article', 'Nested.svelte', 6, 0],
			['span', 'main.svelte', 12, 0],
			['div', 'main.svelte', 13, 0],
			['b', 'main.svelte', 13, 13],
			['i', 'main.svelte', 16, 1],
			['em', 'main.svelte', 20, 0],
			['strong', 'main.svelte', 21, 0],
			['small', 'main.svelte', 22, 0]
		];

		for (const [selector, file, line, column] of expected) {
			assert.deepEqual(loc(/** @type {Element} */ (target.querySelector(selector))), {
				file,
				line,
				column
			});
		}
	}
});
