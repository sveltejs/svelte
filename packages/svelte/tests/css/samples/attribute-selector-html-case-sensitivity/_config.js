import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector "input[autocomplete="on"]"',
			start: {
				character: 178,
				column: 1,
				line: 16
			},
			end: {
				character: 202,
				column: 25,
				line: 16
			}
		}
	]
});
