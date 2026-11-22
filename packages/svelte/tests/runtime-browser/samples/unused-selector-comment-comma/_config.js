import { test } from '../../assert';

export default test({
	compileOptions: { css: 'injected' },
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 4,
				column: 1,
				character: 49
			},
			end: {
				line: 4,
				column: 8,
				character: 56
			}
		}
	],
	test({ assert, target, window }) {
		const [p] = target.querySelectorAll('p');
		assert.equal(window.getComputedStyle(p).color, 'rgb(255, 0, 0)');
	}
});
