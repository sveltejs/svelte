import { test } from '../../test';

export default test({
	skip: true,
	css_map_sources: ['input.svelte'],
	preprocess: [
		{
			style: ({ content }) => {
				// Modified without source map
				return { code: content + ' ' };
			},
			script: ({ content }) => {
				// Not modified
				return { code: content };
			}
		}
	]
});
