import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 73,
				column: 1,
				character: 966
			},
			end: {
				line: 73,
				column: 16,
				character: 981
			}
		},
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector "unused :global"',
			start: {
				line: 104,
				column: 29,
				character: 1272
			},
			end: {
				line: 104,
				column: 43,
				character: 1286
			}
		}
	]
});
