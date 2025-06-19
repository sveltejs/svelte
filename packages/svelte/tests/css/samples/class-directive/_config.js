import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".third"\nhttps://svelte.dev/e/css_unused_selector',
			start: {
				line: 7,
				column: 2,
				character: 166
			},
			end: {
				line: 7,
				column: 8,
				character: 172
			}
		}
	]
});
