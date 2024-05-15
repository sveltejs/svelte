import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".foo"',
			start: {
				line: 4,
				column: 1,
				character: 34
			},
			end: {
				line: 4,
				column: 5,
				character: 38
			}
		},

		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".baz"',
			start: {
				line: 4,
				column: 13,
				character: 46
			},
			end: {
				line: 4,
				column: 17,
				character: 50
			}
		}
	]
});
