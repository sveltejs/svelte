import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 16,
				column: 1,
				character: 128
			},
			end: {
				line: 16,
				column: 16,
				character: 143
			}
		}
	]
});
