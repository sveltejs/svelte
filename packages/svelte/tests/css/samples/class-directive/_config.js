import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".forth"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 8,
				column: 2,
				character: 190
			},
			end: {
				line: 8,
				column: 8,
				character: 196
			}
		}
	]
});
