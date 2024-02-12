import { test } from '../../test';
import { magic_string_bundle } from '../../helpers.js';

export const EXTERNAL = 'span { --external-var: 1px; }';

export default test({
	skip: true,
	css_map_sources: ['input.svelte', 'external.css'],
	preprocess: [
		{
			style: ({ content, filename = '' }) => {
				return magic_string_bundle([
					{ code: EXTERNAL, filename: 'external.css' },
					{ code: content, filename }
				]);
			}
		}
	]
});
