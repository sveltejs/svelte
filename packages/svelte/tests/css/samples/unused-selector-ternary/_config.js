import { test } from '../../test';

export default test({
	props: {
		active: true
	},
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".maybeactive"',
			start: {
				line: 16,
				column: 1,
				character: 163
			},
			end: {
				line: 16,
				column: 13,
				character: 175
			}
		}
	]
});
