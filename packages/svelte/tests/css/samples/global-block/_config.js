import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 39,
				column: 1,
				character: 492
			},
			end: {
				line: 39,
				column: 16,
				character: 507
			}
		}
	]
});
