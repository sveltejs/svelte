import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".x"',
			start: {
				line: 4,
				column: 1,
				character: 31
			},
			end: {
				line: 4,
				column: 3,
				character: 33
			}
		}
	]
});
