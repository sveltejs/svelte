import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 41,
				column: 1,
				character: 647
			},
			end: {
				line: 41,
				column: 16,
				character: 662
			}
		}
	]
});
