import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused"',
			start: {
				line: 2,
				column: 1,
				character: 9
			},
			end: {
				line: 2,
				column: 8,
				character: 16
			}
		}
	]
});
