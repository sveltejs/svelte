import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 24,
				column: 1,
				character: 548
			},
			end: {
				line: 24,
				column: 8,
				character: 555
			}
		}
	]
});
