import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},
	html: '<h1>title</h1><section>card</section><p>after</p>',
	test({ target, assert }) {
		for (const [selector, file, line] of [
			['h1', 'main.svelte', 5],
			['section', 'Card.svelte', 1],
			['p', 'main.svelte', 7]
		]) {
			// @ts-expect-error
			assert.deepEqual(target.querySelector(selector).__svelte_meta?.loc, {
				file,
				line,
				column: 0
			});
		}
	}
});
