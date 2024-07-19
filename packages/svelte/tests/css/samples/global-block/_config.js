import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".unused :global"',
			start: {
				line: 31,
				column: 1,
				character: 400
			},
			end: {
				line: 31,
				column: 16,
				character: 415
			}
		}
	]
});
