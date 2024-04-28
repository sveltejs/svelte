import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector "img[alt=""]"',
			start: {
				character: 87,
				column: 1,
				line: 8
			},
			end: {
				character: 98,
				column: 12,
				line: 8
			}
		}
	]
});
