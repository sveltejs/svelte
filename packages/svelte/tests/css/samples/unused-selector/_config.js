import { test } from '../../test';

export default test({
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".bar"',
			start: {
				line: 8,
				column: 1,
				character: 60
			},
			end: {
				line: 8,
				column: 5,
				character: 64
			}
		}
	]
});
