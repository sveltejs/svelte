import { test } from '../../test';
import { magic_string_bundle } from '../../helpers.js';

const EXTERNAL = 'span { --external-var: 1px; }';

export default test({
	css_map_sources: ['input.svelte', 'external.css'],
	preprocess: [
		{
			style: ({ content }) => {
				return magic_string_bundle([
					{ code: EXTERNAL, filename: 'external.css' },
					{ code: content, filename: 'input.svelte' }
				]);
			}
		}
	],
	preprocessed: [{ str: '--component-var: 2px' }, { code: EXTERNAL, str: '--external-var: 1px' }]
});
