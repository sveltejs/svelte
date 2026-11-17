import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: {
		dev: true
	},

	test({ target, assert }) {
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(
			output.innerHTML,
			`
				<section><span>raw</span></section>
				<p>after direct</p>
				<section><span>raw</span></section>
				<strong>after dynamic</strong>
			`
		);

		const sections = output.querySelectorAll('section');
		assert.equal(sections.length, 2);
		const component = /** @type {any} */ (output).__svelte_meta.component;
		assert.ok(component);
		for (const section of sections) {
			assert.equal(/** @type {any} */ (section).__svelte_meta.component, component);
		}

		/** @type {Array<[number, string]>} */
		const renders = [
			[12, 'raw'],
			[14, 'snippets.raw']
		];

		for (const [index, [line, snippetName]] of renders.entries()) {
			const loc = { file: 'main.svelte', line, column: 1 };

			// Raw roots belong to their render callsite, not their declaration or the next element.
			// @ts-expect-error
			assert.deepInclude(sections[index].__svelte_meta, {
				loc,
				parent: { ...loc, type: 'render', snippetName, parent: null }
			});
		}

		/** @type {Array<[string, number, number]>} */
		const expected = [
			['h1', 10, 0],
			['output', 11, 0],
			['p', 13, 1],
			['strong', 15, 1]
		];

		for (const [selector, line, column] of expected) {
			const [element] = target.querySelectorAll(selector);

			// @ts-expect-error
			assert.deepInclude(element.__svelte_meta, {
				loc: { file: 'main.svelte', line, column },
				parent: null
			});
		}
	}
});
