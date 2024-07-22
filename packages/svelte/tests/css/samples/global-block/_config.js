import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 53,
				column: 1,
				character: 752
			},
			end: {
				line: 53,
				column: 16,
				character: 767
			}
		}
	]
});
