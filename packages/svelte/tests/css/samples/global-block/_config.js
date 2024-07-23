import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 69,
				column: 1,
				character: 917
			},
			end: {
				line: 69,
				column: 16,
				character: 932
			}
		}
	]
});
