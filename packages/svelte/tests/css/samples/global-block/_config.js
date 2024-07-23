import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 63,
				column: 1,
				character: 871
			},
			end: {
				line: 63,
				column: 16,
				character: 886
			}
		}
	]
});
